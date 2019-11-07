describe('Navigating around the app', () => {

  beforeEach(() => {
    cy.fixture("users/admin").as("admin");
  });
  // previous test omitted for brevity
  it("Should be able to login and redirect to user page", function() {
    cy.visit("http://localhost:9000/sign-in");
    
    cy
      .get('input[name="email"]')
      .type(this.admin.email)
      .should("have.value", this.admin.email);
    cy
      .get('input[name="password"]')
      .type(this.admin.password)
      .should("have.value", this.admin.password);
    cy.get("form").submit();
    cy.location("pathname").should("eq", "/user");
  });

  it("Should be able to redirect to the members page", function() {
    cy.visit("http://localhost:9000/members");

    cy.location("pathname").should("eq", "/members");
  });

  it("Should be able to return to the user page", function() {
    cy.contains('Go Back').click();

    cy.location("pathname").should("eq", "/user");
  });

  it("Should be able to redirect to the friends page", function() {
    cy.visit("http://localhost:9000/friends");

    cy.location("pathname").should("eq", "/friends");
  });

  it("Should be able to return to the user page", function() {
    cy.contains('Go Back').click();

    cy.location("pathname").should("eq", "/user");
  });

  it("Should be able to redirect to the account page", function() {
    cy.visit("http://localhost:9000/edit-account");

    cy.location("pathname").should("eq", "/edit-account");
  });

  it("Should be able to return to the user page", function() {
    cy.contains('Go Back').click();

    cy.location("pathname").should("eq", "/user");
  });

  it("Should be able to sign the user out", function() {
    cy.contains('Sign Out').click();

    cy.location("pathname").should("eq", "/sign-in");
  });
});