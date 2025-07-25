import { clickSave } from "../../utils";
import {
  getProjectSettingsRoute,
  ProjectSettingsTabRoutes,
  saveButtonEnabled,
} from "./constants";

describe("projectSettings/containers", () => {
  const destination = getProjectSettingsRoute(
    "spruce",
    ProjectSettingsTabRoutes.Containers,
  );
  beforeEach(() => {
    cy.visit(destination);
    // Wait for page content to load.
    cy.contains("Container Configurations").should("exist");
  });
  it("shouldn't have any container configurations defined", () => {
    cy.dataCy("container-size-row").should("not.exist");
  });
  it("shouldn't be able to save anything if no changes were made", () => {
    saveButtonEnabled(false);
  });
  it("should be able to add and save container configuration and then delete it", () => {
    // Add configuration
    cy.dataCy("add-button").should("be.visible");
    cy.dataCy("add-button").trigger("mouseover");
    cy.dataCy("add-button").click();
    cy.dataCy("container-size-row").should("exist");

    // Test validation for empty fields
    cy.getInputByLabel("Name").type("test container");
    cy.getInputByLabel("Memory (MB)").clear();
    cy.getInputByLabel("CPU").clear();
    saveButtonEnabled(false);

    cy.getInputByLabel("Memory (MB)").type("1024");
    cy.getInputByLabel("CPU").type("1024");
    saveButtonEnabled(true);
    cy.dataCy("save-settings-button").scrollIntoView();
    clickSave();
    cy.validateToast("success", "Successfully updated project");

    // Delete configuration
    cy.dataCy("container-size-row").should("exist");
    cy.dataCy("delete-item-button").should("be.visible");
    cy.dataCy("delete-item-button").should("not.be.disabled");
    cy.dataCy("delete-item-button").trigger("mouseover");
    cy.dataCy("delete-item-button").click();

    cy.dataCy("container-size-row").should("not.exist");
    cy.dataCy("save-settings-button").scrollIntoView();
    clickSave();
    cy.validateToast("success", "Successfully updated project");
  });
});
