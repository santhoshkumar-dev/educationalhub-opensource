# Contributing to EducationalHub.in

First off, thank you for considering contributing to EducationalHub! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and inclusive.

## Getting Started

### Issues

- **Bug Reports**: Include steps to reproduce, expected behavior, and actual behavior
- **Feature Requests**: Describe the feature and why it would be useful
- **Questions**: Use GitHub Discussions for questions

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/educationalhub-frontend.git
   cd educationalhub-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Fill in your development values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:

```
feat(video-player): add quality selector
fix(auth): resolve login redirect issue
docs(readme): update installation steps
```

## Pull Request Process

1. **Ensure your code passes linting**

   ```bash
   npm run lint
   ```

2. **Test your changes locally**

3. **Update documentation** if needed

4. **Create a Pull Request** with:

   - Clear title following commit conventions
   - Description of changes
   - Screenshots for UI changes
   - Link to related issue(s)

5. **Wait for review** - maintainers will review your PR

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define types/interfaces for props and state
- Avoid `any` type when possible

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow existing naming conventions
- Ensure responsive design

### Files & Folders

- Use PascalCase for components: `VideoPlayer.tsx`
- Use camelCase for utilities: `uploadToCloudinary.ts`
- Group related components in folders

## Questions?

Feel free to open a GitHub Discussion or reach out to the maintainers.

---

Thank you for contributing! 🙏
