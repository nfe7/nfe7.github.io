// AI Features have been disabled for this deployment
export const generateSummary = async (content: string, context: 'repo' | 'notebook' = 'repo'): Promise<string> => {
  return "";
};

export const askQuestionAboutCode = async (codeContext: string, question: string): Promise<string> => {
  return "";
}