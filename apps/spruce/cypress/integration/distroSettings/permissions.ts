import { users } from "../../constants";

describe("distro permissions", () => {
  beforeEach(() => {
    cy.logout();
  });

  it("hides the new distro button when a user cannot create distros", () => {
    cy.login(users.privileged);
    cy.visit("/distro/rhel71-power8-large/settings/general");
    cy.dataCy("new-distro-button").should("not.exist");
    cy.dataCy("delete-distro-button").should(
      "not.have.attr",
      "aria-disabled",
      "true",
    );
    cy.get("textarea").should("not.be.disabled");
  });

  it("disables the delete button when user lacks admin permissions", () => {
    cy.login(users.regular);
    cy.visit("/distro/rhel71-power8-large/settings/general");
    cy.dataCy("delete-distro-button").should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("disables fields when user lacks edit permissions", () => {
    cy.login(users.regular);
    cy.visit("/distro/rhel71-power8-large/settings/general");
    cy.dataCy("distro-settings-page").within(() => {
      cy.get('input[type="checkbox"]').should(
        "have.attr",
        "aria-disabled",
        "true",
      );
      cy.get("textarea").should("have.attr", "aria-disabled", "true");
    });
  });

  it("enables fields if user has edit permissions for a particular distro", () => {
    cy.login(users.regular);
    cy.visit("/distro/localhost/settings/general");
    cy.dataCy("distro-settings-page").within(() => {
      cy.get('input[type="checkbox"]').should(
        "have.attr",
        "aria-disabled",
        "false",
      );
      cy.get("textarea").should("have.attr", "aria-disabled", "false");
    });
  });
});
