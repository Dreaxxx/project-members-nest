-- SQLite
INSERT OR IGNORE INTO groups (id, name) VALUES (1, 'A'), (2, 'B');

INSERT OR IGNORE INTO group_members (group_id, member_type, member_id)
VALUES
  (1, 'user', 4),
  (1, 'group', 2);

INSERT OR IGNORE INTO group_members (group_id, member_type, member_id)
VALUES
  (2, 'user', 2),
  (2, 'user', 3);
