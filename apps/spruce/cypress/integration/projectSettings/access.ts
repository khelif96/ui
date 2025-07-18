import { clickSave } from "../../utils";
import {
  getProjectSettingsRoute,
  project,
  ProjectSettingsTabRoutes,
  projectUseRepoEnabled,
  saveButtonEnabled,
} from "./constants";

describe("Access page", () => {
  const origin = getProjectSettingsRoute(
    projectUseRepoEnabled,
    ProjectSettingsTabRoutes.Access,
  );
  beforeEach(() => {
    cy.visit(origin);
    saveButtonEnabled(false);
    cy.dataCy("default-to-repo-button")
      .should("be.visible")
      .should("be.enabled")
      .should("not.have.attr", "aria-disabled", "true");
  });

  it("Changing settings and clicking the save button produces a success toast and the changes are persisted", () => {
    cy.contains("label", "Unrestricted").click();
    cy.getInputByLabel("Unrestricted").should("be.checked");
    // Input and save username
    cy.contains("Add Username").click();
    cy.getInputByLabel("Username").as("usernameInput");
    cy.get("@usernameInput").type("admin");
    cy.get("@usernameInput").should("have.value", "admin").should("be.visible");
    clickSave();
    cy.validateToast("success", "Successfully updated project");
    // Assert persistence
    cy.reload();
    cy.getInputByLabel("Username").as("usernameInput");
    cy.get("@usernameInput").should("have.value", "admin").should("be.visible");
    // Delete a username
    cy.dataCy("delete-item-button").should("be.visible").click();
    cy.get("@usernameInput").should("not.exist");
    clickSave();
    cy.validateToast("success", "Successfully updated project");
    // Assert persistence
    cy.reload();
    saveButtonEnabled(false);
    cy.get("@usernameInput").should("not.exist");
  });

  it("Clicking on 'Default to Repo on Page' selects the 'Default to repo (unrestricted)' radio box and produces a success banner", () => {
    cy.dataCy("default-to-repo-button").should(
      "have.attr",
      "aria-disabled",
      "false",
    );
    cy.dataCy("default-to-repo-button").click();
    cy.getInputByLabel('Type "confirm" to confirm your action').type("confirm");
    cy.dataCy("default-to-repo-modal").contains("Confirm").click();
    cy.validateToast("success", "Successfully defaulted page to repo");
    cy.getInputByLabel("Default to repo (unrestricted)").should("be.checked");
  });

  it("Submitting an invalid admin username produces an error toast", () => {
    cy.visit(getProjectSettingsRoute(project, ProjectSettingsTabRoutes.Access));
    cy.contains("Add Username").click();
    cy.getInputByLabel("Username").type("mongodb_user");
    clickSave();
    cy.validateToast("error", "There was an error saving the project");
  });
});
