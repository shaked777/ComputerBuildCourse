import type { Question } from '../types'

/**
 * Curated diagram-based questions for chapters ז (single-cycle) and ח (multi-cycle),
 * built from the course practice sheets + summaries (Patterson & Hennessy figures).
 *
 * Kept separate from the generated bank so regenerating
 * computer_organization_brilliant_bank.json never clobbers them. Merged into the
 * bank in src/lib/questions.ts. `image` points to a file in /public/diagrams.
 */

const SINGLE = 'מעבד חד-מחזורי (Single-Cycle)'
const MULTI = 'מעבד רב-מחזורי (Multi-Cycle)'

export const EXTRA_QUESTIONS: Question[] = [
  /* ───────────────────────── פרק ז · מעבד חד-מחזורי ───────────────────────── */
  {
    id: 1001,
    topic: SINGLE,
    image: 'single-cycle-datapath.png',
    question: 'במסלול הנתונים החד-מחזורי שבתמונה, מהו תפקיד המרבב (Mux) שאות הבקרה שלו הוא ALUSrc?',
    options: [
      'בוחר אם הקלט השני ל-ALU יהיה Read data 2 (אוגר) או ההיסט המורחב בסימן.',
      'בוחר את אוגר היעד לכתיבה (rt או rd).',
      'בוחר אם הערך הנכתב לאוגר מגיע מה-ALU או מהזיכרון.',
      'בוחר את הכתובת הבאה של ה-PC.',
    ],
    correct_answer: 'בוחר אם הקלט השני ל-ALU יהיה Read data 2 (אוגר) או ההיסט המורחב בסימן.',
    explanation:
      'אות הבקרה ALUSrc שולט על המרבב שלפני הקלט השני של ה-ALU: כאשר ALUSrc=0 נכנס ערך האוגר (Read data 2), וכאשר ALUSrc=1 נכנס ההיסט המורחב בסימם (לפקודות כמו lw/sw).',
  },
  {
    id: 1002,
    topic: SINGLE,
    image: 'single-cycle-datapath.png',
    question: 'מהו תפקיד המרבב שאות הבקרה שלו הוא RegDst במסלול הנתונים החד-מחזורי?',
    options: [
      'בוחר את מספר אוגר היעד לכתיבה: rt (סיביות 20-16) לעומת rd (סיביות 15-11).',
      'בוחר את הקלט השני של ה-ALU.',
      'מחליט אם לכתוב לזיכרון.',
      'בוחר בין PC+4 ליעד הקפיצה.',
    ],
    correct_answer: 'בוחר את מספר אוגר היעד לכתיבה: rt (סיביות 20-16) לעומת rd (סיביות 15-11).',
    explanation:
      'בפקודות R-type אוגר היעד הוא rd (Instruction[15-11]) ולכן RegDst=1, ואילו בפקודת lw אוגר היעד הוא rt (Instruction[20-16]) ולכן RegDst=0.',
  },
  {
    id: 1003,
    topic: SINGLE,
    image: 'single-cycle-datapath.png',
    question: 'מהו תפקיד המרבב שאות הבקרה שלו הוא MemtoReg?',
    options: [
      'בוחר אם הערך שייכתב חזרה לאוגר מגיע מתוצאת ה-ALU או מ-Read data של הזיכרון.',
      'בוחר את כתובת הזיכרון.',
      'בוחר את אוגר היעד.',
      'קובע אם הפקודה היא קפיצה.',
    ],
    correct_answer: 'בוחר אם הערך שייכתב חזרה לאוגר מגיע מתוצאת ה-ALU או מ-Read data של הזיכרון.',
    explanation:
      'בפקודת lw הערך מגיע מהזיכרון ולכן MemtoReg=1; בפקודות R-type הערך מגיע מתוצאת ה-ALU ולכן MemtoReg=0.',
  },
  {
    id: 1004,
    topic: SINGLE,
    image: 'single-cycle-control-unit.png',
    question: 'בתמונה, יחידת הבקרה (Control) מפיקה את אותות הבקרה על סמך אילו סיביות מהפקודה?',
    options: [
      'סיביות ה-opcode, Instruction[31-26].',
      'סיביות ה-funct, Instruction[5-0].',
      'סיביות האוגר rs, Instruction[25-21].',
      'ההיסט, Instruction[15-0].',
    ],
    correct_answer: 'סיביות ה-opcode, Instruction[31-26].',
    explanation:
      'יחידת הבקרה הראשית מפענחת את שדה ה-opcode (6 הסיביות העליונות, Instruction[31-26]) וקובעת לפיו את כל אותות הבקרה. שדה ה-funct משמש את בקרת ה-ALU בלבד.',
  },
  {
    id: 1005,
    topic: SINGLE,
    image: 'single-cycle-control-unit.png',
    question: 'מהו תפקידה של יחידת ה-Sign-extend בתמונה?',
    options: [
      'מרחיבה את ההיסט בן 16 הסיביות ל-32 סיביות תוך שמירת הסימן.',
      'מבצעת הזזה שמאלה ב-2.',
      'מחשבת את כתובת הקפיצה.',
      'מפענחת את ה-opcode.',
    ],
    correct_answer: 'מרחיבה את ההיסט בן 16 הסיביות ל-32 סיביות תוך שמירת הסימן.',
    explanation:
      'הפקודות I-type מכילות שדה מיידי/היסט בן 16 סיביות. יחידת Sign-extend מרחיבה אותו ל-32 סיביות (משכפלת את ביט הסימן) כדי שניתן יהיה להשתמש בו ב-ALU או בחישוב כתובת הענף.',
  },
  {
    id: 1006,
    topic: SINGLE,
    image: 'control-signals-table.png',
    question: 'לפי טבלת אותות הבקרה שבתמונה, מהו הערך של RegDst עבור פקודת lw?',
    options: ['0', '1', 'X (לא אכפת)', '2'],
    correct_answer: '0',
    explanation:
      'בפקודת lw אוגר היעד הוא rt (Instruction[20-16]), ולכן RegDst=0 (המרבב בוחר את שדה ה-rt).',
  },
  {
    id: 1007,
    topic: SINGLE,
    image: 'control-signals-table.png',
    question: 'לפי הטבלה, אילו אותות בקרה הם "לא אכפת" (X) עבור פקודת sw?',
    options: ['RegDst ו-MemtoReg', 'MemWrite ו-ALUSrc', 'Branch ו-ALUOp', 'RegWrite ו-MemRead'],
    correct_answer: 'RegDst ו-MemtoReg',
    explanation:
      'פקודת sw אינה כותבת לאף אוגר (RegWrite=0), לכן אין משמעות לבחירת אוגר היעד (RegDst) ולמקור הכתיבה (MemtoReg) — שניהם X.',
  },
  {
    id: 1008,
    topic: SINGLE,
    image: 'control-signals-table.png',
    question: 'לפי הטבלה, מהם הערכים של ALUSrc ו-Branch עבור פקודת beq?',
    options: [
      'ALUSrc=0, Branch=1',
      'ALUSrc=1, Branch=1',
      'ALUSrc=0, Branch=0',
      'ALUSrc=1, Branch=0',
    ],
    correct_answer: 'ALUSrc=0, Branch=1',
    explanation:
      'beq מחסרת שני אוגרים כדי לבדוק שוויון, ולכן ALUSrc=0 (הקלט השני הוא אוגר). מכיוון שזו פקודת ענף, Branch=1 כדי לאפשר עדכון PC ליעד הענף אם Zero=1.',
  },
  {
    id: 1009,
    topic: SINGLE,
    image: 'single-cycle-datapath.png',
    question: 'כיצד מחושבת כתובת היעד של ענף (Branch target) במסלול הנתונים?',
    options: [
      'PC+4 ועוד ההיסט המורחב בסימן לאחר הזזה שמאלה ב-2.',
      'ההיסט המורחב בסימן בלבד.',
      'PC+4 בלבד.',
      'הכתובת המאוחסנת באוגר $ra.',
    ],
    correct_answer: 'PC+4 ועוד ההיסט המורחב בסימן לאחר הזזה שמאלה ב-2.',
    explanation:
      'כתובת היעד = (PC+4) + (sign-extend(offset) << 2). ההזזה ב-2 היא משום שהכתובות מיושרות למילים (4 בתים), והחישוב נעשה ע"י ALU נוסף ייעודי.',
  },
  {
    id: 1010,
    topic: SINGLE,
    question: 'מהו החיסרון העיקרי של מעבד חד-מחזורי (Single-Cycle)?',
    options: [
      'זמן מחזור השעון נקבע לפי הפקודה האיטית ביותר (lw), כך שכל הפקודות נמשכות זמן זה.',
      'הוא דורש זיכרון נפרד לפקודות ולנתונים שאי אפשר לממש.',
      'הוא אינו יכול לבצע פקודות R-type.',
      'הוא דורש יותר מחזורי שעון לכל פקודה מאשר מעבד רב-מחזורי.',
    ],
    correct_answer:
      'זמן מחזור השעון נקבע לפי הפקודה האיטית ביותר (lw), כך שכל הפקודות נמשכות זמן זה.',
    explanation:
      'במעבד חד-מחזורי כל פקודה מסתיימת במחזור שעון אחד, ולכן אורך המחזור חייב להספיק לפקודה הארוכה ביותר (lw, העוברת קריאת פקודה → קריאת אוגרים → ALU → גישה לזיכרון → כתיבה לאוגר). פקודות מהירות "מבזבזות" את שאר הזמן.',
  },
  {
    id: 1011,
    topic: SINGLE,
    image: 'single-cycle-datapath.png',
    question: 'איזו פקודה מפעילה את המסלול הקריטי (הארוך ביותר) במעבד חד-מחזורי?',
    options: ['lw', 'add', 'beq', 'j'],
    correct_answer: 'lw',
    explanation:
      'lw עוברת את כל היחידות: קריאת פקודה, קריאת אוגרים, ALU (חישוב כתובת), גישה לזיכרון נתונים, וכתיבה חזרה לאוגר — חמישה שלבים, המסלול הארוך ביותר.',
  },
  {
    id: 1012,
    topic: SINGLE,
    image: 'control-signals-table.png',
    question: 'לפי הטבלה, מהו הערך של MemRead עבור פקודת R-type (כגון add)?',
    options: ['0', '1', 'X', 'תלוי ב-funct'],
    correct_answer: '0',
    explanation:
      'פקודת R-type אינה ניגשת לזיכרון הנתונים כלל — היא קוראת אוגרים, מבצעת פעולה ב-ALU וכותבת חזרה לאוגר. לכן MemRead=0 (וגם MemWrite=0).',
  },

  /* ───────────────────────── פרק ח · מעבד רב-מחזורי ───────────────────────── */
  {
    id: 1051,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question:
      'במסלול הנתונים הרב-מחזורי שבתמונה, איזה אוגר מאחסן את הערך שנקרא מהזיכרון בפקודת lw לפני הכתיבה לאוגר?',
    options: ['MDR (Memory Data Register)', 'IR (Instruction Register)', 'ALUOut', 'אוגר A'],
    correct_answer: 'MDR (Memory Data Register)',
    explanation:
      'במעבד רב-מחזורי הקריאה מהזיכרון נמשכת מחזור שלם, והערך נשמר באוגר ה-MDR. במחזור הבא הוא נכתב לאוגר היעד דרך המרבב של MemtoReg.',
  },
  {
    id: 1052,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question: 'מהו תפקידו של אוגר ה-IR (Instruction Register) במעבד רב-מחזורי?',
    options: [
      'לשמור את הפקודה שנקראה, כדי שאפשר יהיה להשתמש באותו זיכרון לנתונים בהמשך.',
      'לשמור את תוצאת ה-ALU בין המחזורים.',
      'לשמור את הערך שנקרא מהזיכרון.',
      'לשמור את כתובת היעד של קפיצה.',
    ],
    correct_answer:
      'לשמור את הפקודה שנקראה, כדי שאפשר יהיה להשתמש באותו זיכרון לנתונים בהמשך.',
    explanation:
      'מכיוון שיש זיכרון יחיד לפקודות ולנתונים, יש לשמור את הפקודה שנקראה ב-IR (בעזרת אות IRWrite) כדי שמחזורים מאוחרים יוכלו לגשת לזיכרון לצורך נתונים מבלי לאבד את הפקודה.',
  },
  {
    id: 1053,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question: 'את מה מאחסנים אוגרי A ו-B שנוספו במעבד הרב-מחזורי?',
    options: [
      'את שני הערכים שנקראו מקובץ האוגרים (rs ו-rt).',
      'את תוצאת ה-ALU ואת הערך מהזיכרון.',
      'את ה-PC ואת ה-IR.',
      'את אותות הבקרה של המצב הנוכחי.',
    ],
    correct_answer: 'את שני הערכים שנקראו מקובץ האוגרים (rs ו-rt).',
    explanation:
      'בסוף מחזור פענוח/קריאת אוגרים, שני הערכים הנקראים מקובץ האוגרים נשמרים באוגרי A ו-B, כך שהם זמינים ל-ALU במחזור הבא.',
  },
  {
    id: 1054,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question: 'איזה אוגר מאחסן את תוצאת ה-ALU כדי להשתמש בה במחזור שעון מאוחר יותר?',
    options: ['ALUOut', 'MDR', 'IR', 'PC'],
    correct_answer: 'ALUOut',
    explanation:
      'תוצאת ה-ALU נשמרת באוגר ALUOut בסוף המחזור, כדי שתהיה זמינה במחזור הבא (למשל ככתובת זיכרון בפקודת lw/sw, או כתוצאה הנכתבת לאוגר ב-R-type).',
  },
  {
    id: 1055,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question:
      'במעבד הרב-מחזורי קיים זיכרון יחיד לפקודות ולנתונים. איזה אות בקרה בוחר את כתובת הגישה אליו?',
    options: [
      'IorD — בוחר בין ה-PC (קריאת פקודה) לבין ALUOut (גישת נתונים).',
      'MemRead — קובע את כתובת הזיכרון.',
      'PCSource — בוחר את כתובת הזיכרון.',
      'ALUSrcA — בוחר את כתובת הזיכרון.',
    ],
    correct_answer: 'IorD — בוחר בין ה-PC (קריאת פקודה) לבין ALUOut (גישת נתונים).',
    explanation:
      'אות IorD (Instruction or Data) שולט על המרבב שמזין את כתובת הזיכרון: כאשר IorD=0 הכתובת היא ה-PC (קריאת פקודה), וכאשר IorD=1 הכתובת היא ALUOut (גישה לנתונים ב-lw/sw).',
  },
  {
    id: 1056,
    topic: MULTI,
    image: 'multicycle-fsm.png',
    question:
      'לפי מכונת המצבים שבתמונה, במצב 0 (Instruction fetch) מה מחושב ב-ALU וכיצד מתעדכן ה-PC?',
    options: [
      'ALU מחשב PC+4 (ALUSrcB=01), וה-PC מתעדכן עם PCWrite ו-PCSource=00.',
      'ALU מחשב את יעד הענף, וה-PC מתעדכן ל-ALUOut.',
      'ALU מחסר שני אוגרים, וה-PC לא משתנה.',
      'ALU מחשב את כתובת הזיכרון של lw.',
    ],
    correct_answer:
      'ALU מחשב PC+4 (ALUSrcB=01), וה-PC מתעדכן עם PCWrite ו-PCSource=00.',
    explanation:
      'במצב fetch מוזנים ל-ALU ה-PC (ALUSrcA=0) והקבוע 4 (ALUSrcB=01) כדי לחשב PC+4. בו-זמנית נקראת הפקודה (MemRead, IorD=0, IRWrite) וה-PC מתעדכן (PCWrite, PCSource=00).',
  },
  {
    id: 1057,
    topic: MULTI,
    image: 'multicycle-fsm.png',
    question: 'במכונת המצבים, דרך כמה מצבים עוברת פקודת lw עד לסיומה?',
    options: ['5 מצבים', '3 מצבים', '4 מצבים', '1 מצב'],
    correct_answer: '5 מצבים',
    explanation:
      'lw עוברת: מצב 0 (fetch) → 1 (decode) → 2 (חישוב כתובת) → 3 (קריאה מהזיכרון) → 4 (כתיבה לאוגר). סך הכל 5 מחזורי שעון — הפקודה הארוכה ביותר.',
  },
  {
    id: 1058,
    topic: MULTI,
    image: 'multicycle-fsm.png',
    question: 'במצב 1 (Instruction decode / register fetch) מה מחושב באופן ספקולטיבי?',
    options: [
      'כתובת יעד הענף (Branch target), למקרה שהפקודה תהיה ענף.',
      'תוצאת פעולת R-type.',
      'כתובת הזיכרון של lw.',
      'הערך הנכתב לאוגר.',
    ],
    correct_answer: 'כתובת יעד הענף (Branch target), למקרה שהפקודה תהיה ענף.',
    explanation:
      'במצב 1, בזמן שהפקודה מפוענחת והאוגרים נקראים, ה-ALU מחשב מראש את יעד הענף (ALUSrcA=0, ALUSrcB=11 — היסט מורחב ומוזז) ושומר ב-ALUOut. אם בסוף זו אינה פקודת ענף — התוצאה פשוט מוזנחת.',
  },
  {
    id: 1059,
    topic: MULTI,
    image: 'multicycle-fsm.png',
    question:
      'במצב 8 (Branch completion) של מכונת המצבים, אילו אותות בקרה פעילים כדי לבצע beq?',
    options: [
      'ALUSrcA=1, ALUSrcB=00, ALUOp=01, PCWriteCond, PCSource=01.',
      'ALUSrcA=0, ALUSrcB=01, PCWrite, PCSource=00.',
      'MemRead, IorD=1.',
      'RegDst=1, RegWrite, MemtoReg=0.',
    ],
    correct_answer: 'ALUSrcA=1, ALUSrcB=00, ALUOp=01, PCWriteCond, PCSource=01.',
    explanation:
      'במצב 8 ה-ALU מחסר את שני האוגרים (ALUSrcA=1, ALUSrcB=00, ALUOp=01 לחיסור). אם התוצאה אפס (Zero=1) ו-PCWriteCond פעיל, ה-PC מתעדכן ליעד הענף (PCSource=01).',
  },
  {
    id: 1060,
    topic: MULTI,
    image: 'multicycle-fsm.png',
    question: 'באיזה מצב מסתיימת פקודת קפיצה (j), ומה קורה בו?',
    options: [
      'מצב 9 — Jump completion: PCWrite פעיל ו-PCSource=10.',
      'מצב 7 — R-type completion.',
      'מצב 4 — Memory read completion.',
      'מצב 0 — Instruction fetch.',
    ],
    correct_answer: 'מצב 9 — Jump completion: PCWrite פעיל ו-PCSource=10.',
    explanation:
      'פקודת j מסתיימת במצב 9: ה-PC מתעדכן (PCWrite) לכתובת היעד של הקפיצה (PCSource=10), המורכבת מ-PC[31-28] ומ-Instruction[25-0] לאחר הזזה ב-2.',
  },
  {
    id: 1061,
    topic: MULTI,
    image: 'multicycle-datapath.png',
    question:
      'בביצוע lw, בפעימת השעון השלישית (מצב 2 — חישוב כתובת), מה מחשב ה-ALU?',
    options: [
      'את כתובת הזיכרון: A + הרחבת-הסימן של ההיסט.',
      'את PC+4.',
      'את החיסור של שני האוגרים לבדיקת שוויון.',
      'את יעד הקפיצה.',
    ],
    correct_answer: 'את כתובת הזיכרון: A + הרחבת-הסימן של ההיסט.',
    explanation:
      'במצב 2 (ALUSrcA=1, ALUSrcB=10) מוזנים ל-ALU האוגר A (ערך rs) וההיסט המורחב בסימן, וה-ALU מחשב את כתובת הזיכרון ALUOut = A + sign-extend(offset).',
  },
  {
    id: 1062,
    topic: MULTI,
    question:
      'מהו היתרון העיקרי של מעבד רב-מחזורי (Multi-Cycle) על פני חד-מחזורי?',
    options: [
      'כל פקודה משתמשת רק במספר המחזורים שהיא צריכה, ואורך המחזור נקבע לפי השלב האיטי ביותר ולא לפי הפקודה האיטית ביותר.',
      'הוא מבצע כל פקודה במחזור שעון אחד בלבד.',
      'הוא אינו זקוק ליחידת בקרה.',
      'הוא משתמש בשני זיכרונות נפרדים ולכן מהיר יותר.',
    ],
    correct_answer:
      'כל פקודה משתמשת רק במספר המחזורים שהיא צריכה, ואורך המחזור נקבע לפי השלב האיטי ביותר ולא לפי הפקודה האיטית ביותר.',
    explanation:
      'במעבד רב-מחזורי הפקודה מחולקת לשלבים קצרים (1–5 מחזורים): פקודות מהירות (כמו beq) מסתיימות במעט מחזורים, ויחידות פונקציונליות (ALU, זיכרון) משמשות מחדש בין השלבים. כך אורך המחזור קצר יותר ואין בזבוז זמן.',
  },
]
