import type { MatchPair, Question } from '../types'

/**
 * Purpose-built interactive questions (Tap-to-Arrange & Matching Pairs).
 * These layouts need ordered/paired data that can't be derived from a plain
 * multiple-choice item, so they're authored explicitly with a `kind`.
 * Kept separate so regenerating the main bank never clobbers them.
 */

const MIPS = 'שפת סף MIPS'
const SINGLE = 'מעבד חד-מחזורי (Single-Cycle)'
const MULTI = 'מעבד רב-מחזורי (Multi-Cycle)'
const PIPE = 'מסלול נתונים וצנרת'

const arrange = (
  id: number,
  topic: string,
  question: string,
  sequence: string[],
  explanation: string,
): Question => ({
  id,
  topic,
  kind: 'arrange',
  question,
  sequence,
  options: sequence,
  correct_answer: sequence.join('  →  '),
  explanation,
})

const matching = (
  id: number,
  topic: string,
  question: string,
  pairs: MatchPair[],
  explanation: string,
): Question => ({
  id,
  topic,
  kind: 'matching',
  question,
  pairs,
  options: pairs.map((p) => p.term),
  correct_answer: pairs.map((p) => `${p.term} = ${p.match}`).join('  ·  '),
  explanation,
})

export const INTERACTIVE_QUESTIONS: Question[] = [
  /* ───────────── Tap-to-Arrange ───────────── */
  arrange(
    2001,
    PIPE,
    'סדרו את חמשת שלבי הצנרת (Pipeline) לפי סדר ביצועם:',
    ['IF', 'ID', 'EX', 'MEM', 'WB'],
    'סדר השלבים בצנרת הקלאסית של MIPS: IF (קריאת פקודה) → ID (פענוח וקריאת אוגרים) → EX (ביצוע ב-ALU) → MEM (גישה לזיכרון) → WB (כתיבה חזרה לאוגר).',
  ),
  arrange(
    2002,
    MULTI,
    'סדרו את שלבי ביצוע פקודת lw במעבד רב-מחזורי:',
    ['קריאת פקודה (Fetch)', 'פענוח וקריאת אוגרים', 'חישוב כתובת הזיכרון', 'קריאה מהזיכרון', 'כתיבה לאוגר'],
    'lw עוברת 5 מחזורי שעון: Fetch → Decode → חישוב כתובת (ALUOut = A + offset) → קריאה מהזיכרון (ל-MDR) → כתיבה לאוגר היעד.',
  ),
  arrange(
    2003,
    MIPS,
    'סדרו את שלבי הקריאה לפונקציה (Procedure Call) ב-MIPS:',
    ['שמירת $ra במחסנית', 'קפיצה עם jal', 'ביצוע גוף הפונקציה', 'שחזור $ra מהמחסנית', 'חזרה עם jr $ra'],
    'בקריאה לפונקציה: שומרים את כתובת החזרה ($ra) במחסנית במידת הצורך, קופצים עם jal, מבצעים את הפונקציה, משחזרים את $ra, וחוזרים עם jr $ra.',
  ),

  /* ───────────── Matching Pairs ───────────── */
  matching(
    2051,
    MIPS,
    'התאימו כל אוגר MIPS לתפקידו:',
    [
      { term: '$zero', match: 'הקבוע 0' },
      { term: '$ra', match: 'כתובת חזרה מפונקציה' },
      { term: '$sp', match: 'מצביע ראש המחסנית' },
      { term: '$a0', match: 'ארגומנט ראשון לפונקציה' },
    ],
    '$zero מחזיק תמיד 0, $ra (return address) שומר את כתובת החזרה, $sp (stack pointer) מצביע לראש המחסנית, ו-$a0 הוא הארגומנט הראשון המועבר לפונקציה.',
  ),
  matching(
    2052,
    PIPE,
    'התאימו כל שלב בצנרת לפעולה שהוא מבצע:',
    [
      { term: 'IF', match: 'קריאת הפקודה מהזיכרון' },
      { term: 'ID', match: 'פענוח וקריאת אוגרים' },
      { term: 'EX', match: 'ביצוע פעולה ב-ALU' },
      { term: 'MEM', match: 'גישה לזיכרון הנתונים' },
    ],
    'חמשת השלבים: IF=Instruction Fetch, ID=Instruction Decode/קריאת אוגרים, EX=Execute (ALU), MEM=גישה לזיכרון, WB=Write Back.',
  ),
  matching(
    2053,
    SINGLE,
    'התאימו כל אות בקרה לתפקידו במסלול הנתונים החד-מחזורי:',
    [
      { term: 'RegDst', match: 'בחירת מספר אוגר היעד' },
      { term: 'ALUSrc', match: 'בחירת הקלט השני ל-ALU' },
      { term: 'MemtoReg', match: 'מקור הערך הנכתב לאוגר' },
      { term: 'Branch', match: 'אפשור קפיצה מותנית (ענף)' },
    ],
    'RegDst בוחר את אוגר היעד (rt/rd), ALUSrc בוחר בין אוגר להיסט המורחב, MemtoReg בוחר בין תוצאת ALU לזיכרון, ו-Branch מאפשר עדכון PC ליעד ענף כש-Zero=1.',
  ),
  arrange(
    2101,
    MIPS,
    'סדרו את פקודות ה-MIPS כדי לקרוא איבר מהזיכרון, להוסיף לו 4 ולשמור חזרה:',
    ['lw $t0, 0($s0)', 'addi $t0, $t0, 4', 'sw $t0, 0($s0)'],
    'קודם טוענים את הערך מהזיכרון לאוגר (lw), אחר כך מוסיפים לו 4 עם קבוע מיידי (addi), ולבסוף כותבים חזרה לזיכרון (sw).',
  ),
  arrange(
    2102,
    SINGLE,
    'סדרו את שלבי ביצוע פקודת lw במעבד חד-מחזורי (בתוך מחזור שעון אחד):',
    ['קריאת הפקודה', 'קריאת אוגר הבסיס', 'חישוב הכתובת ב-ALU', 'קריאה מזיכרון הנתונים', 'כתיבה לאוגר היעד'],
    'המסלול הקריטי של lw: קריאת הפקודה מזיכרון הפקודות → קריאת אוגר הבסיס → חיבור ההיסט ב-ALU → גישה לזיכרון הנתונים → כתיבת הערך לאוגר היעד.',
  ),
  arrange(
    2103,
    'זיכרון מטמון (Cache)',
    'סדרו את רכיבי היררכיית הזיכרון מהמהיר ביותר לאיטי ביותר:',
    ['אוגרים', 'מטמון L1', 'זיכרון ראשי (RAM)', 'דיסק'],
    'היררכיית הזיכרון בנויה ממהיר-וקטן לאיטי-וגדול: אוגרים בתוך המעבד, מטמון L1 צמוד למעבד, זיכרון ראשי (DRAM), ולבסוף אחסון בדיסק.',
  ),
  matching(
    2151,
    PIPE,
    'התאימו כל סיכון (Hazard) בצנרת להגדרתו:',
    [
      { term: 'Structural Hazard', match: 'שתי פקודות צריכות את אותו משאב חומרה' },
      { term: 'Data Hazard', match: 'פקודה תלויה בתוצאה שטרם חושבה' },
      { term: 'Control Hazard', match: 'אי-ודאות לגבי הפקודה הבאה (ענף)' },
      { term: 'Forwarding', match: 'העברת תוצאה ישירות לקלט ה-ALU' },
    ],
    'סיכון מבני = תחרות על משאב חומרה; סיכון נתונים = תלות בתוצאה קודמת; סיכון בקרה = ענפים; ו-Forwarding הוא הפתרון המעביר תוצאות ישירות בין שלבים.',
  ),
  matching(
    2152,
    'ייצוג נתונים ונקודה צפה',
    'התאימו כל שדה בפורמט IEEE 754 (32 סיביות) לתיאורו:',
    [
      { term: 'Sign', match: 'סיבית אחת — סימן המספר' },
      { term: 'Exponent', match: '8 סיביות — חזקה עם היסט' },
      { term: 'Mantissa', match: '23 סיביות — השבר' },
      { term: 'Bias', match: '127 — ההיסט של האקספוננט' },
    ],
    'פורמט Single Precision: סיבית סימן אחת, 8 סיביות אקספוננט המאוחסן עם היסט (Bias) של 127, ו-23 סיביות מנטיסה (שבר).',
  ),
  matching(
    2153,
    'זיכרון מטמון (Cache)',
    'התאימו כל מונח מטמון להגדרתו:',
    [
      { term: 'Hit', match: 'הנתון נמצא במטמון' },
      { term: 'Miss', match: 'הנתון אינו במטמון' },
      { term: 'Tag', match: 'מזהה את הבלוק שבכתובת' },
      { term: 'Index', match: 'בוחר את הסט במטמון' },
    ],
    'Hit = פגיעה (הנתון במטמון), Miss = החטאה, שדה ה-Tag מזהה איזה בלוק זיכרון מאוחסן בשורה, ושדה ה-Index בוחר לאיזה סט לגשת.',
  ),
]
