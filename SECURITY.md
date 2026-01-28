# Security Policy

## Reporting a Vulnerability

We take the security of EducationalHub seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security@educationalhub.in**

Include the following information:

- Type of vulnerability (XSS, SQL injection, auth bypass, etc.)
- Location of the vulnerable code (file path, line number)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment

### What to Expect

- **Response Time**: We aim to acknowledge receipt within 48 hours
- **Updates**: We will keep you informed of our progress
- **Disclosure**: We will coordinate disclosure timing with you
- **Credit**: We will credit reporters in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

When deploying this application:

### Environment Variables

- **NEVER commit `.env` files** to version control
- Use strong, unique secrets for all API keys
- Rotate credentials regularly
- Use environment-specific secrets (dev vs prod)

### Database

- Use strong MongoDB passwords
- Enable authentication on all database connections
- Limit network access to your database
- Regular backups

### Authentication

- The app uses Clerk for authentication - keep your Clerk keys secure
- Enable 2FA for admin accounts
- Review Clerk security settings regularly

### Payments

- Keep payment credentials (PayU, Stripe) strictly confidential
- Use test mode credentials for development
- Never log payment data

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Updates

We will announce security updates through:

- GitHub Security Advisories
- Release notes

---

Thank you for helping keep EducationalHub and its users safe!
