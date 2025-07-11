import { clickSave } from "../../utils";
import {
  getProjectSettingsRoute,
  ProjectSettingsTabRoutes,
  saveButtonEnabled,
} from "./constants";

describe("Views & filters page", () => {
  const destination = getProjectSettingsRoute(
    "sys-perf",
    ProjectSettingsTabRoutes.ViewsAndFilters,
  );

  beforeEach(() => {
    cy.visit(destination);
    // Wait for page content to finish loading.
    cy.dataCy("parsley-filter-list").children().should("have.length", 2);
    saveButtonEnabled(false);
  });

  describe("parsley filters", () => {
    it("does not allow saving with invalid regular expression or empty expression", () => {
      cy.contains("button", "Add filter").should("be.visible").click();
      cy.dataCy("parsley-filter-expression").first().type("*");
      saveButtonEnabled(false);
      cy.contains("Value should be a valid regex expression.");
      cy.dataCy("parsley-filter-expression").first().clear();
      saveButtonEnabled(false);
    });

    it("does not allow saving with duplicate filter expressions", () => {
      cy.contains("button", "Add filter").should("be.visible").click();
      cy.dataCy("parsley-filter-expression").first().type("filter_1");
      saveButtonEnabled(false);
      cy.contains("Filter expression already appears in this project.");
    });

    it("can successfully save and delete filter", () => {
      cy.contains("button", "Add filter").should("be.visible").click();
      cy.dataCy("parsley-filter-expression").first().type("my_filter");
      saveButtonEnabled(true);
      clickSave();
      cy.validateToast("success", "Successfully updated project");
      cy.dataCy("parsley-filter-list").children().should("have.length", 3);

      cy.dataCy("delete-item-button").first().scrollIntoView();
      cy.dataCy("delete-item-button").first().should("be.visible").click();
      clickSave();
      cy.validateToast("success", "Successfully updated project");
      cy.dataCy("parsley-filter-list").children().should("have.length", 2);
    });
  });
});
