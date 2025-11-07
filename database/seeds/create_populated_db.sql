-- Create a user
INSERT INTO user (id, email, firstName, lastName, password, personalizedInfo, settings, role, emailVerified) 
VALUES (
  'db619a70-c346-4444-89df-3e5181528a34',
  'snevemoney12@gmail.com',
  'evens',
  'louis',
  '$2a$10$fakehashedpasswordthatneedstobereplacedwithrealhashedpassword',
  '{}',
  '{"allowSSOManualLogin": true, "userActivated": true}',
  'global:owner',
  1
);

-- Create a project
INSERT INTO project (id, name, type, relations) 
VALUES (
  'SF4pJV9FxUwRkZkW',
  'evens louis <snevemoney12@gmail.com>',
  'personal',
  '[]'
);

-- Create project relation
INSERT INTO project_relation (id, role, userId, projectId)
VALUES (
  'relation1',
  'project:personalOwner', 
  'db619a70-c346-4444-89df-3e5181528a34',
  'SF4pJV9FxUwRkZkW'
);
