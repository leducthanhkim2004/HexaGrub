describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login'); // Navigate to login page before each test
  });

  it('should display login form', () => {
    cy.get('form').should('be.visible');
    cy.get('input#email').should('exist');
    cy.get('input#password').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error for empty fields', () => {
    cy.get('button[type="submit"]').click();
    // Check if validation is triggered on the email field
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should('not.be.empty');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input#email').type('invalid@example.com');
    cy.get('input#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('.bg-red-50.border.border-red-400').should('contain', 'Invalid login credentials');
  });

it('should login successfully with valid credentials', () => {
    cy.get('input#email').type('10422105@student.vgu.edu.vn');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.get('header').contains('HexaGrub').should('be.visible');
});
});