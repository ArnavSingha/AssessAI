'use server';

import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

async function parseResume(
  fileBuffer: ArrayBuffer,
  fileType: string
): Promise<string> {
  if (fileType === 'application/pdf') {
    const data = await pdf(Buffer.from(fileBuffer));
    return data.text;
  } else if (
    fileType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({
      arrayBuffer: fileBuffer,
    });
    return value;
  } else {
    throw new Error('Unsupported file type');
  }
}

export async function parseResumeAction(formData: FormData): Promise<{
  success: boolean;
  text?: string;
  profileData?: { name: string; email: string; phone: string };
  error?: string;
}> {
  try {
    const file = formData.get('resume') as File;
    if (!file) {
      throw new Error('No resume file provided.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const text = await parseResume(arrayBuffer, file.type);

    const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(
      /(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/
    );

    const profileData = {
      name: nameMatch ? nameMatch[0] : '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
    };

    return { success: true, text, profileData };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
