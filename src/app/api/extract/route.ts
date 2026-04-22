import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Biomarker } from '../../../types/biomarker';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// If classification is an object, extract the string value
const normalizeClassification = (c: unknown): string => {
  if (typeof c === 'string') return c.toLowerCase();
  if (typeof c === 'object' && c !== null) {
    const obj = c as Record<string, unknown>;
    return (obj.value || obj.status || obj.classification || obj.label || Object.values(obj)[0] || 'unknown').toString().toLowerCase();
  }
  return 'unknown';
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Convert PDF to base64 for Claude's native PDF reading
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const prompt = `You are a medical data extraction AI. Extract biomarker information from this PDF document and return ONLY valid JSON with no markdown formatting or additional text.

Extract the following information:
1. Patient's age and sex
2. All biomarkers with their values, units, and reference ranges
3. Standardize biomarker names and units to English
4. Classify each biomarker as "optimal", "normal", or "out of range" based on age and sex

IMPORTANT: The classification field must be a plain string — one of exactly: "optimal", "normal", or "out of range". Do not nest it inside an object.

Return JSON in this exact structure:
{
  "patient": {
    "age": number,
    "sex": "male" | "female"
  },
  "biomarkers": [
    {
      "name": "string",
      "value": "string",
      "unit": "string",
      "reference_range": "string",
      "classification": "optimal" | "normal" | "out of range"
    }
  ]
}

`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64String
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean the response by removing markdown code blocks and extracting only JSON
    let cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Find the first { and last } to extract just the JSON object
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    }

    let result;
    try {
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', responseText);
      console.error('Cleaned response:', cleanedResponse);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Normalize classification fields in biomarkers
    if (result && result.biomarkers && Array.isArray(result.biomarkers)) {
      result.biomarkers = result.biomarkers.map((biomarker: Biomarker) => ({
        ...biomarker,
        classification: normalizeClassification(biomarker.classification) as Biomarker['classification']
      }));
    }

    return NextResponse.json({
      ...result,
      fileName: file.name
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}