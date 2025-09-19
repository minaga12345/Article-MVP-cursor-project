/**
 * Basic tests for quote-matching logic
 * Run with: node tests/quote-matching.test.js
 */

// Mock quote detection patterns
const quotePatterns = [
  /"([^"]{10,})"/g,  // Double quotes
  /'([^']{10,})'/g,  // Single quotes
  /"([^"]{5,})"/g,   // Shorter double quotes
  /'([^']{5,})'/g,   // Shorter single quotes
];

// Mock source content
const mockSource = {
  id: 'source1',
  title: 'Test Source',
  content: 'This is a test source with some important information. The company was founded in 2020 and has grown rapidly. "We believe in innovation" said the CEO. The team consists of 50+ engineers working on cutting-edge technology.'
};

// Mock draft content
const mockDraft = 'The company was founded in 2020 and has grown rapidly. According to the CEO, "We believe in innovation" and the team consists of 50+ engineers. This shows their commitment to technology.';

// Quote detection function
function detectQuotes(draft, sources) {
  const quotes = [];
  let quoteIndex = 0;
  
  quotePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(draft)) !== null) {
      const quote = match[1].trim();
      if (quote.length < 5) continue;
      
      let bestSource = null;
      let bestConfidence = 0;
      let bestSnippet = '';
      
      sources.forEach(source => {
        const sourceText = source.content.toLowerCase();
        const quoteText = quote.toLowerCase();
        
        if (sourceText.includes(quoteText)) {
          const confidence = 0.95;
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestSource = source;
            const startIndex = sourceText.indexOf(quoteText);
            const snippetStart = Math.max(0, startIndex - 50);
            const snippetEnd = Math.min(source.content.length, startIndex + quoteText.length + 50);
            bestSnippet = source.content.substring(snippetStart, snippetEnd) + '...';
          }
        }
      });
      
      if (bestSource) {
        quotes.push({
          id: `quote-${quoteIndex}`,
          quote: quote,
          sourceId: bestSource.id,
          sourceTitle: bestSource.title,
          sourceSnippet: bestSnippet,
          matchType: 'exact',
          confidence: bestConfidence
        });
        quoteIndex++;
      }
    }
  });
  
  return quotes;
}

// Test cases
function runTests() {
  console.log('🧪 Running Quote Matching Tests\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Basic quote detection
  total++;
  console.log('Test 1: Basic quote detection');
  const quotes = detectQuotes(mockDraft, [mockSource]);
  const hasQuote = quotes.some(q => q.quote.includes('We believe in innovation'));
  if (hasQuote) {
    console.log('✅ PASS: Found expected quote');
    passed++;
  } else {
    console.log('❌ FAIL: Did not find expected quote');
    console.log('Found quotes:', quotes.map(q => q.quote));
  }
  
  // Test 2: Quote source mapping
  total++;
  console.log('\nTest 2: Quote source mapping');
  const mappedQuote = quotes.find(q => q.quote.includes('We believe in innovation'));
  if (mappedQuote && mappedQuote.sourceId === 'source1') {
    console.log('✅ PASS: Quote correctly mapped to source');
    passed++;
  } else {
    console.log('❌ FAIL: Quote not correctly mapped to source');
  }
  
  // Test 3: Confidence scoring
  total++;
  console.log('\nTest 3: Confidence scoring');
  if (mappedQuote && mappedQuote.confidence >= 0.9) {
    console.log('✅ PASS: High confidence score assigned');
    passed++;
  } else {
    console.log('❌ FAIL: Low confidence score');
  }
  
  // Test 4: Source snippet generation
  total++;
  console.log('\nTest 4: Source snippet generation');
  if (mappedQuote && mappedQuote.sourceSnippet && mappedQuote.sourceSnippet.length > 0) {
    console.log('✅ PASS: Source snippet generated');
    passed++;
  } else {
    console.log('❌ FAIL: No source snippet generated');
  }
  
  // Test 5: Multiple quote detection
  total++;
  console.log('\nTest 5: Multiple quote detection');
  const draftWithMultipleQuotes = 'The CEO said "We believe in innovation" and also mentioned "cutting-edge technology" in the interview.';
  const multipleQuotes = detectQuotes(draftWithMultipleQuotes, [mockSource]);
  if (multipleQuotes.length >= 2) {
    console.log('✅ PASS: Multiple quotes detected');
    passed++;
  } else {
    console.log('❌ FAIL: Expected multiple quotes, found:', multipleQuotes.length);
  }
  
  // Test 6: No false positives
  total++;
  console.log('\nTest 6: No false positives');
  const draftWithoutQuotes = 'This is a regular sentence without any quoted text.';
  const noQuotes = detectQuotes(draftWithoutQuotes, [mockSource]);
  if (noQuotes.length === 0) {
    console.log('✅ PASS: No false positive quotes');
    passed++;
  } else {
    console.log('❌ FAIL: False positive quotes detected:', noQuotes.length);
  }
  
  // Results
  console.log('\n📊 Test Results:');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }
}

// Run tests
runTests();
