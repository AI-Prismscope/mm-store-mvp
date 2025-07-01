# The complete code for: repo_to_text.py
# (From Horacio Chacón's Medium article)

import os
import git

def get_repo_root():
    """Get the root directory of the Git repository."""
    try:
        repo = git.Repo(search_parent_directories=True)
        return repo.working_tree_dir
    except git.InvalidGitRepositoryError:
        print("This is not a Git repository.")
        return None

def get_ignored_files(repo_root):
    """Get a set of files and directories ignored by .gitignore."""
    ignored = set()
    gitignore_path = os.path.join(repo_root, '.gitignore')
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # This handles directories (like /node_modules/) and files
                    ignored.add(line.replace('/', ''))
    # Always ignore the .git directory and the script itself
    ignored.add('.git')
    ignored.add('repo_to_text.py')
    ignored.add('output.txt')
    return ignored

def repo_to_text(repo_path, ignored_files):
    """
    Traverse the repository, read files, and concatenate them into a single string.
    """
    repo_text = ""
    for root, dirs, files in os.walk(repo_path):
        # Remove ignored directories from traversal
        dirs[:] = [d for d in dirs if d not in ignored_files]
        
        for file in files:
            if file not in ignored_files:
                try:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        repo_text += f"# File: {relative_path}\n"
                        repo_text += f"{content}\n\n"
                        repo_text += "---\n\n"
                except Exception as e:
                    repo_text += f"# Could not read file: {relative_path}\n"
                    repo_text += f"# Error: {e}\n\n"
                    repo_text += "---\n\n"
    return repo_text

def main():
    repo_root = get_repo_root()
    if repo_root:
        print(f"Repository root found at: {repo_root}")
        ignored_files = get_ignored_files(repo_root)
        print(f"Ignoring the following: {ignored_files}")
        
        repo_text = repo_to_text(repo_root, ignored_files)
        
        with open('output.txt', 'w', encoding='utf-8') as f:
            f.write(repo_text)
        
        print("\nRepository content has been written to output.txt")

if __name__ == '__main__':
    # You might need to install the GitPython library first:
    # pip install GitPython
    main()