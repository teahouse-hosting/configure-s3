set windows-powershell := true

# Show this help
@help:
  just --list

# Set up dev environments
install:
  npm install

# Run the pre-commit build
build:
  npm run format:write
  npm run package