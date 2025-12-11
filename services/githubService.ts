import { GitHubRepo, GitHubFile } from '../types';

const BASE_URL = 'https://api.github.com';

export const fetchUserRepos = async (username: string): Promise<GitHubRepo[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=12`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('User not found');
      throw new Error('Failed to fetch repos');
    }
    return await response.json();
  } catch (error) {
    console.error("GitHub API Error:", error);
    throw error;
  }
};

export const fetchRepoContents = async (owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> => {
  try {
    // Note: path defaults to empty string, which fetches root.
    // If path is provided, we append it. encoding is handled mostly by fetch but we are careful with structure.
    const url = path 
      ? `${BASE_URL}/repos/${owner}/${repo}/contents/${path}` 
      : `${BASE_URL}/repos/${owner}/${repo}/contents`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch contents');
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.sort((a, b) => {
        // Sort directories first, then files
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });
    }
    return [data]; 
  } catch (error) {
    console.error("GitHub Content Error:", error);
    throw error;
  }
};

export const fetchRawFile = async (downloadUrl: string): Promise<string> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error('Failed to download file');
  return await response.text();
};