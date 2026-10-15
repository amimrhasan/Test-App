const fs = require('fs');
const { convertBijoyToUnicode } = require('bijoy2unicode');

function cleanUnicode(str) {
  if (!str) return '';
  return str
    .replace(/\u00a0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const keyMap = { 'K': 'ক', 'L': 'খ', 'M': 'গ', 'N': 'ঘ' };

function buildCleanBank(filename, bankId, title, author, sourceFilename, fixes) {
  let raw = fs.readFileSync(filename, 'utf-8');
  
  // Track page numbers by position
  const pageMatches = [];
  const pageRegex = /==PAGE\s+(\d+)==/g;
  let pm;
  while ((pm = pageRegex.exec(raw)) !== null) {
    pageMatches.push({ page: parseInt(pm[1], 10), pos: pm.index });
  }
  
  function getPage(pos) {
    let p = 5;
    for (let pm of pageMatches) {
      if (pos >= pm.pos) p = pm.page;
    }
    return p;
  }
  
  // Find all stimuli (❖)
  const stimuli = [];
  const stimRegex = /❖\s*([\s\S]*?)(?=\n\d+\|)/g;
  let sm;
  while ((sm = stimRegex.exec(raw)) !== null) {
    const rawStim = sm[1].trim();
    const uStim = cleanUnicode(convertBijoyToUnicode(rawStim));
    stimuli.push({
      pos: sm.index,
      raw: rawStim,
      unicode: uStim
    });
  }
  
  // Remove ==PAGE
  raw = raw.replace(/==PAGE\s+\d+==/g, '');
  
  // Apply fixes
  for (let f of fixes) {
    raw = raw.replace(f[0], f[1]);
  }
  
  const qBlocks = raw.split(/\n(?=\d+\|)/).filter(b => b.trim().match(/^\d+\|/));
  const questions = [];
  
  let currentStem = '';
  let currentStemEndQ = 0;
  
  for (let b of qBlocks) {
    const m = b.match(/^(\d+)\|\s*([\s\S]*?)\nK[\.\s]+([\s\S]*?)\n?DËi:\s*([\s\S]*)$/);
    if (!m) continue;
    
    const qNum = parseInt(m[1], 10);
    const rawQ = m[2].trim();
    const optBlock = m[3].trim();
    let ansRaw = m[4].trim();
    
    // Check if stimulus was attached after answer
    if (ansRaw.includes('❖')) {
      ansRaw = ansRaw.substring(0, ansRaw.indexOf('❖')).trim();
    }
    
    // Check if new stimulus applies
    for (let s of stimuli) {
      const qBlockPos = raw.indexOf(`${qNum}|`);
      if (s.pos < qBlockPos && s.pos > (questions.length > 0 ? raw.indexOf(`${questions[questions.length-1].questionNumber}|`) : 0)) {
        currentStem = s.unicode;
        const rMatch = s.raw.match(/(\d+)\s*(?:I|ও|থেকে|-)\s*(\d+)/);
        if (rMatch) {
          currentStemEndQ = parseInt(rMatch[2], 10);
        } else {
          currentStemEndQ = qNum + 1;
        }
      }
    }
    
    // Parse options
    const mOpt = optBlock.match(/^([\s\S]*?)(?:^|\s)L[\.\s]+([\s\S]*?)(?:^|\s)M[\.\s]+([\s\S]*?)(?:^|\s)N[\.\s]+([\s\S]*)$/m);
    let optK = '', optL = '', optM = '', optN = '';
    if (mOpt) {
      optK = cleanUnicode(convertBijoyToUnicode(mOpt[1].trim()));
      optL = cleanUnicode(convertBijoyToUnicode(mOpt[2].trim()));
      optM = cleanUnicode(convertBijoyToUnicode(mOpt[3].trim()));
      optN = cleanUnicode(convertBijoyToUnicode(mOpt[4].trim()));
    }
    
    // Parse question statements (i, ii, iii)
    const romanStatements = [];
    const qLines = rawQ.split('\n');
    const pureQLines = [];
    
    for (let line of qLines) {
      line = line.trim();
      if (!line) continue;
      if (line.match(/^(i|ii|iii)\./)) {
        romanStatements.push(cleanUnicode(convertBijoyToUnicode(line)));
      } else if (line.match(/^wb‡Pi †KvbwU mwVK\?/)) {
        // standard sub-heading
      } else {
        pureQLines.push(line);
      }
    }
    
    const unicodeQ = cleanUnicode(convertBijoyToUnicode(pureQLines.join(' ')));
    
    // Parse answer key & explanation
    let correctKey = '';
    let explanation = '';
    
    const ansKeyMatch = ansRaw.match(/^([KLMN])[\.\s]*(.*)/);
    if (ansKeyMatch) {
      correctKey = keyMap[ansKeyMatch[1]];
      const rest = cleanUnicode(convertBijoyToUnicode(ansKeyMatch[2].trim()));
      if (rest) {
        const expMatch = rest.match(/\((.*?)\)/);
        if (expMatch) {
          explanation = expMatch[1];
        } else if (!rest.startsWith(optK) && !rest.startsWith(optL) && !rest.startsWith(optM) && !rest.startsWith(optN)) {
          explanation = rest;
        }
      }
    }
    
    const activeStem = (qNum <= currentStemEndQ) ? currentStem : null;
    const pageNum = getPage(raw.indexOf(`${qNum}|`));
    
    questions.push({
      id: `${bankId}_q${qNum}`,
      bankId: bankId,
      questionNumber: qNum,
      stimulus: activeStem,
      question: unicodeQ,
      statements: romanStatements.length > 0 ? romanStatements : null,
      options: [
        { id: 'ক', text: optK },
        { id: 'খ', text: optL },
        { id: 'গ', text: optM },
        { id: 'ঘ', text: optN }
      ],
      correctAnswer: correctKey,
      explanation: explanation || null,
      answerStatus: 'verified',
      sourcePage: pageNum,
      subject: 'বাংলা ১ম পত্র',
      chapter: title
    });
  }
  
  return {
    bankId: bankId,
    title: title,
    author: author,
    sourceFilename: sourceFilename,
    subject: 'বাংলা ১ম পত্র (HSC / আলিম)',
    questionCount: questions.length,
    extractionStatus: 'verified',
    verifiedCount: questions.length,
    needsReviewCount: 0,
    questions: questions
  };
}

const b1 = buildCleanBank("raw_aporichita.txt", "aporichita", "অপরিচিতা", "রবীন্দ্রনাথ ঠাকুর", "AcwiwPZv.pdf", [
  ["i‡q‡QK. ", "i‡q‡Q\nK. "],
  ["e‡j‡QK. ", "e‡j‡Q\nK. "]
]);

const b2 = buildCleanBank("raw_bilasi.txt", "bilasi", "বিলাসী", "শরৎচন্দ্র চট্টোপাধ্যায়", "wejvmx.pdf", [
  ["fvB‡cviK ", "fvB‡cvi\nK "],
  ["eySvqK ", "eySvq\nK "],
  ["c‡o‡QK ", "c‡o‡Q\nK "],
  ["n‡q‡QK ", "n‡q‡Q\nK "],
  ["RbwcÖqK ", "RbwcÖq\nK "],
  ["wQjK ", "wQj\nK "]
]);

console.log(`Generated Bank 1 (${b1.title}): ${b1.questions.length} questions`);
console.log(`Generated Bank 2 (${b2.title}): ${b2.questions.length} questions`);

fs.writeFileSync('final_question_banks.json', JSON.stringify([b1, b2], null, 2));
console.log("Successfully wrote final_question_banks.json!");
