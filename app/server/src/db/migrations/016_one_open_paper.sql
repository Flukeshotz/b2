-- Same race migration 014 closed for kind='assessment', now for kind='paper'.
-- Exam-practice papers (Goethe/telc standalone sections) are about to get a
-- real start/answer/finish path of their own (src/b2/exam_paper.js) built on
-- the same "SELECT for an open attempt, INSERT if none" pattern that raced
-- for the diagnostic assessment — closing the same hole here before it is
-- ever hit live, rather than after.
CREATE UNIQUE INDEX b2_one_open_paper_per_user
  ON b2_paper_attempts (user_id, paper_id)
  WHERE kind = 'paper' AND finished_at IS NULL;
