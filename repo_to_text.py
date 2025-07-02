# The complete code for: repo_to_text.py (V2 - Robust Version)

import os
import pathspec # Using a dedicated library for gitignore parsing

def get_repo_root():
    """Get the root directory of the project."""
    # A simpler way to get the root is just the current directory,
    # assuming the script is run from the project root.
    return os.getcwd()

def get_pathspec(repo_root):
    """Load the .gitignore patterns into a pathspec object."""
    ignore_patterns = []
    # Add default ignores that should always be skipped
    default_ignores = ['.git', 'repo_to_text.py', 'output.txt', '__pycache__', '.DS_Store']
    ignore_patterns.extend(default_ignores)

    gitignore_path = os.path.join(repo_root, '.gitignore')
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            ignore_patterns.extend(f.read().splitlines())
            
    return pathspec.PathSpec.from_lines('gitwildmatch', ignore_patterns)

def repo_to_text(repo_path, spec):
    """
    Traverse the repository and concatenate files that are not ignored by the spec.
    """
    repo_text = ""
    for root, dirs, files in os.walk(repo_path, topdown=True):
        # Create a list of full paths to check against the spec
        all_paths = [os.path.join(root, name) for name in dirs + files]
        
        # Get a set of ignored paths from this directory
        ignored_paths = {os.path.basename(p) for p in spec.match_files(all_paths)}
        
        # Remove ignored directories from traversal
        dirs[:] = [d for d in dirs if d not in ignored_paths]
        
        for file in files:
            if file not in ignored_paths:
                try:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        repo_text += f"# File: {relative_path}\n"
                        repo_text += "```\n"
                        repo_text += f"{content}\n"
                        repo_text += "```\n\n"
                        repo_text += "---\n\n"
                except Exception as e:
                    repo_text += f"# Could not read file: {relative_path}\n"
                    repo_text += f"# Error: {e}\n\n"
                    repo_text += "---\n\n"
    return repo_text

def main():
    repo_root = get_repo_root()
    if repo_root:
        print(f"Scanning repository at: {repo_root}")
        spec = get_pathspec(repo_root)
        
        repo_text = repo_to_text(repo_root, spec)
        
        with open('output.txt', 'w', encoding='utf-8') as f:
            f.write(repo_text)
        
        print("\nRepository content has been written to output.txt")

if __name__ == '__main__':
    main()