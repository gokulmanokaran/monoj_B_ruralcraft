import { db } from '../db/database';
import { HSCodeMaster } from '../types';

export interface HSSuggestionResult {
  hs_code: string;
  category: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_score: number;
  matched_keywords: string[];
  country_rules: string;
  duty_notes: string;
  disclaimer: string;
}

export class HSCodeService {
  /**
   * Suggest an HS Code based on product title, material, category, and description
   */
  public static suggest(product: {
    name: string;
    material?: string;
    description?: string;
    category_name?: string;
  }): HSSuggestionResult {
    const masterList = db.get('hs_codes');
    const textCorpus = `${product.name} ${product.material || ''} ${product.description || ''} ${product.category_name || ''}`.toLowerCase();

    let bestMatch: HSCodeMaster | null = null;
    let highestScore = -1;
    let bestMatchedKeywords: string[] = [];

    for (const item of masterList) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // Check keywords
      for (const keyword of item.keywords) {
        const kwLower = keyword.toLowerCase();
        if (textCorpus.includes(kwLower)) {
          // Extra weight if keyword matches product name or material directly
          if (product.name.toLowerCase().includes(kwLower)) {
            score += 3;
          } else if (product.material && product.material.toLowerCase().includes(kwLower)) {
            score += 2.5;
          } else {
            score += 1;
          }
          matchedKeywords.push(keyword);
        }
      }

      // Check category name overlap
      if (product.category_name && item.category.toLowerCase().includes(product.category_name.toLowerCase())) {
        score += 2;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
        bestMatchedKeywords = matchedKeywords;
      }
    }

    // Default fallback if no keyword matches strongly
    if (!bestMatch || highestScore <= 0) {
      const fallback = masterList[0];
      return {
        hs_code: fallback.hs_code,
        category: fallback.category,
        description: fallback.description,
        confidence: 'Low',
        confidence_score: 35,
        matched_keywords: ['general handicraft'],
        country_rules: fallback.country_rules,
        duty_notes: fallback.duty_notes,
        disclaimer: 'Suggested HS Code — Demo Platform. Not legally certified. Verify classification before export.'
      };
    }

    const confidence: 'High' | 'Medium' | 'Low' = highestScore >= 4 ? 'High' : (highestScore >= 2 ? 'Medium' : 'Low');
    const confidenceScore = Math.min(96, Math.max(50, Math.round(55 + highestScore * 10)));

    return {
      hs_code: bestMatch.hs_code,
      category: bestMatch.category,
      description: bestMatch.description,
      confidence,
      confidence_score: confidenceScore,
      matched_keywords: bestMatchedKeywords,
      country_rules: bestMatch.country_rules,
      duty_notes: bestMatch.duty_notes,
      disclaimer: 'Suggested HS Code — Demo Platform. Not legally certified. Verify classification before export.'
    };
  }
}
