import {ajv, VALIDATION_HELPERS} from '@/shared/utils/ajv';

describe('AJV Format Validators', () => {
  describe('safeString format', () => {
    describe('happy cases - should pass', () => {
      it('allows lowercase letters', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello'})).toBe(true);
      });

      it('allows uppercase letters', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'HELLO'})).toBe(true);
      });

      it('allows numbers', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '12345'})).toBe(true);
      });

      it('allows mixed alphanumeric', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'Hello123'})).toBe(true);
      });

      it('allows dots', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello.world'})).toBe(true);
      });

      it('allows commas', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello,world'})).toBe(true);
      });

      it('allows exclamation marks', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello!world'})).toBe(true);
      });

      it('allows all safe characters combined', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'Hello123.World,Test!'})).toBe(true);
      });

      it('allows single character', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'a'})).toBe(true);
      });
    });

    describe('edge cases - should fail', () => {
      it('rejects HTML tags', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '<script>alert()</script>'})).toBe(false);
      });

      it('rejects angle brackets', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        const validate = ajv.compile(schema);
        expect(validate({text: 'hello<world'})).toBe(false);
        expect(validate({text: 'hello>world'})).toBe(false);
      });

      it('rejects curly braces (JSON/object injection)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '{malicious}'})).toBe(false);
      });

      it('rejects square brackets', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '[array]'})).toBe(false);
      });

      it('rejects backslashes', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello\\world'})).toBe(false);
      });

      it('rejects at symbols', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'test@example'})).toBe(false);
      });

      it('rejects hash symbols', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '#hashtag'})).toBe(false);
      });

      it('rejects spaces', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello world'})).toBe(false);
      });

      it('rejects quotes', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        const validate = ajv.compile(schema);
        expect(validate({text: `hello"world`})).toBe(false);
        expect(validate({text: `hello'world`})).toBe(false);
      });

      it('rejects semicolons', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello;world'})).toBe(false);
      });

      it('rejects parentheses', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello(world)'})).toBe(false);
      });

      it('rejects dollar signs', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '$variable'})).toBe(false);
      });

      it('rejects forward slashes', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello/world'})).toBe(false);
      });

      it('rejects percent signs', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '100%'})).toBe(false);
      });

      it('rejects plus signs', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'test+plus'})).toBe(false);
      });

      it('rejects equals signs', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'key=value'})).toBe(false);
      });

      it('rejects URL schemes', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'javascript:alert(1)'})).toBe(false);
      });

      it('rejects common XSS vectors', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, format: 'safeString'}},
          required: ['text'],
        };
        const validate = ajv.compile(schema);
        expect(validate({text: 'onclick=alert()'})).toBe(false);
        expect(validate({text: 'onerror=alert()'})).toBe(false);
      });
    });
  });

  /**
   * ============================================================================
   * ALPHANUMERIC FORMAT: allows a-z, A-Z, 0-9 only
   * ============================================================================
   */
  describe('alphanumeric format', () => {
    const schema = {
      type: 'object',
      properties: {
        text: {type: 'string', format: 'alphanumeric'},
      },
      required: ['text'],
    };
    const validate = ajv.compile(schema);

    describe('happy cases - should pass', () => {
      it('allows lowercase letters', () => {
        expect(validate({text: 'hello'})).toBe(true);
      });

      it('allows uppercase letters', () => {
        expect(validate({text: 'HELLO'})).toBe(true);
      });

      it('allows numbers', () => {
        expect(validate({text: '12345'})).toBe(true);
      });

      it('allows mixed alphanumeric', () => {
        expect(validate({text: 'User123ABC'})).toBe(true);
      });

      it('allows single character', () => {
        expect(validate({text: 'a'})).toBe(true);
        expect(validate({text: 'Z'})).toBe(true);
        expect(validate({text: '5'})).toBe(true);
      });
    });

    describe('edge cases - should fail', () => {
      it('rejects dots', () => {
        expect(validate({text: 'hello.world'})).toBe(false);
      });

      it('rejects commas', () => {
        expect(validate({text: 'hello,world'})).toBe(false);
      });

      it('rejects exclamation marks', () => {
        expect(validate({text: 'hello!world'})).toBe(false);
      });

      it('rejects spaces', () => {
        expect(validate({text: 'hello world'})).toBe(false);
      });

      it('rejects special characters', () => {
        expect(validate({text: 'test@123'})).toBe(false);
        expect(validate({text: 'test#123'})).toBe(false);
        expect(validate({text: 'test$123'})).toBe(false);
      });

      it('rejects HTML', () => {
        expect(validate({text: '<script>'})).toBe(false);
      });

      it('rejects SQL injection patterns', () => {
        expect(validate({text: "'; DROP TABLE users; --"})).toBe(false);
      });
    });
  });

  /**
   * ============================================================================
   * NOHTMLJS FORMAT: rejects dangerous chars < > { } [ ] \
   * ============================================================================
   */
  describe('noHtmlJs format', () => {
    const schema = {
      type: 'object',
      properties: {
        text: {type: 'string', format: 'noHtmlJs'},
      },
      required: ['text'],
    };
    const validate = ajv.compile(schema);

    describe('happy cases - should pass', () => {
      it('allows regular text', () => {
        expect(validate({text: 'This is a normal text'})).toBe(true);
      });

      it('allows alphanumeric', () => {
        expect(validate({text: 'User123'})).toBe(true);
      });

      it('allows special chars except dangerous ones', () => {
        expect(validate({text: 'hello@world.com'})).toBe(true);
        expect(validate({text: 'test-name_123'})).toBe(true);
        expect(validate({text: 'user$100'})).toBe(true);
      });

      it('allows dots', () => {
        expect(validate({text: 'hello.world.com'})).toBe(true);
      });

      it('allows commas', () => {
        expect(validate({text: 'hello, world, test'})).toBe(true);
      });

      it('allows exclamation marks', () => {
        expect(validate({text: 'hello! world!'})).toBe(true);
      });

      it('allows quotes', () => {
        expect(validate({text: `he said "hello"`})).toBe(true);
        expect(validate({text: `it's working`})).toBe(true);
      });

      it('allows parentheses', () => {
        expect(validate({text: 'test (example)'})).toBe(true);
      });

      it('allows forward slash', () => {
        expect(validate({text: 'path/to/file'})).toBe(true);
      });

      it('allows dashes and underscores', () => {
        expect(validate({text: 'hello-world_test'})).toBe(true);
      });

      it('allows plus and equals', () => {
        expect(validate({text: 'a+b=c'})).toBe(true);
      });

      it('allows hashtag', () => {
        expect(validate({text: '#hashtag'})).toBe(true);
      });

      it('allows percent', () => {
        expect(validate({text: '100% success'})).toBe(true);
      });

      it('allows colon', () => {
        expect(validate({text: 'https://example.com'})).toBe(true);
      });

      it('allows semicolon', () => {
        expect(validate({text: 'first; second'})).toBe(true);
      });
    });

    describe('edge cases - should fail', () => {
      it('rejects angle brackets (HTML)', () => {
        expect(validate({text: '<script>alert()</script>'})).toBe(false);
        expect(validate({text: '<img src=x>'})).toBe(false);
        expect(validate({text: 'hello<world'})).toBe(false);
        expect(validate({text: 'hello>world'})).toBe(false);
      });

      it('rejects curly braces (JSON/object injection)', () => {
        expect(validate({text: '{malicious}'})).toBe(false);
        expect(validate({text: 'function() {}'})).toBe(false);
      });

      it('rejects square brackets (array injection)', () => {
        expect(validate({text: '[1,2,3]'})).toBe(false);
        expect(validate({text: 'array[0]'})).toBe(false);
      });

      it('rejects backslashes (escape sequences)', () => {
        expect(validate({text: 'C:\\Windows\\System32'})).toBe(false);
        expect(validate({text: 'newline\\nhere'})).toBe(false);
      });

      it('rejects XSS payloads', () => {
        expect(validate({text: '<img src=x onerror=alert()>'})).toBe(false);
        expect(validate({text: '<svg onload=alert()>'})).toBe(false);
      });

      it('allows javascript: text (no dangerous chars)', () => {
        expect(validate({text: 'javascript:alert()'})).toBe(true);
      });

      it('allows SQL-like text without dangerous chars', () => {
        expect(validate({text: "'; DROP TABLE users; --"})).toBe(true);
      });

      it('rejects template injection with braces', () => {
        expect(validate({text: '${process.exit()}'})).toBe(false);
      });

      it('allows LDAP-like text without brackets', () => {
        expect(validate({text: '*)(uid=*))(|(uid=*'})).toBe(true);
      });

      it('rejects NoSQL injection', () => {
        expect(validate({text: '{"$ne": null}'})).toBe(false);
      });

      it('allows command-like text without dangerous chars', () => {
        expect(validate({text: '; rm -rf /'})).toBe(true);
        expect(validate({text: '| cat /etc/passwd'})).toBe(true);
      });
    });
  });

  /**
   * ============================================================================
   * VALIDATION HELPERS - Test actual helper objects with spread syntax
   * ============================================================================
   */
  describe('VALIDATION_HELPERS', () => {
    describe('REGULAR_STRING', () => {
      it('allows valid text with noHtmlJs format', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.REGULAR_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'hello world'})).toBe(true);
      });

      it('allows user@example (no format restriction beyond noHtmlJs)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.REGULAR_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'User@Example'})).toBe(true);
      });

      it('rejects text shorter than minLength (3)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.REGULAR_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'ab'})).toBe(false);
      });

      it('rejects text longer than maxLength (255)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.REGULAR_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'a'.repeat(256)})).toBe(false);
      });

      it('rejects HTML/JS dangerous chars', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.REGULAR_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: '<script>alert()</script>'})).toBe(false);
      });
    });

    describe('PASSWORD_STRING', () => {
      it('allows valid passwords with 6+ chars', () => {
        const schema = {
          type: 'object',
          properties: {password: {type: 'string' as const, ...VALIDATION_HELPERS.PASSWORD_STRING}},
          required: ['password'],
        };
        const validate = ajv.compile(schema);
        expect(validate({password: 'MyPassword123!'})).toBe(true);
        expect(validate({password: 'secure@pass'})).toBe(true);
      });

      it('rejects password shorter than minLength (6)', () => {
        const schema = {
          type: 'object',
          properties: {password: {type: 'string' as const, ...VALIDATION_HELPERS.PASSWORD_STRING}},
          required: ['password'],
        };
        expect(ajv.compile(schema)({password: '12345'})).toBe(false);
      });

      it('rejects password longer than maxLength (255)', () => {
        const schema = {
          type: 'object',
          properties: {password: {type: 'string' as const, ...VALIDATION_HELPERS.PASSWORD_STRING}},
          required: ['password'],
        };
        expect(ajv.compile(schema)({password: 'a'.repeat(256)})).toBe(false);
      });

      it('allows special characters in password (no format restriction)', () => {
        const schema = {
          type: 'object',
          properties: {password: {type: 'string' as const, ...VALIDATION_HELPERS.PASSWORD_STRING}},
          required: ['password'],
        };
        expect(ajv.compile(schema)({password: 'P@ss<word>'})).toBe(true);
      });
    });

    describe('LONG_TEXT_STRING', () => {
      it('allows valid long text with 3+ chars', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.LONG_TEXT_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'This is a longer description'})).toBe(true);
      });

      it('rejects text shorter than minLength (3)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.LONG_TEXT_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'ab'})).toBe(false);
      });

      it('rejects text longer than maxLength (1000)', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.LONG_TEXT_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'a'.repeat(1001)})).toBe(false);
      });

      it('rejects HTML/JS dangerous chars', () => {
        const schema = {
          type: 'object',
          properties: {text: {type: 'string' as const, ...VALIDATION_HELPERS.LONG_TEXT_STRING}},
          required: ['text'],
        };
        expect(ajv.compile(schema)({text: 'Normal text with <script>injection</script>'})).toBe(false);
      });
    });

    describe('EMAIL_STRING', () => {
      it('allows valid email addresses', () => {
        const schema = {
          type: 'object',
          properties: {email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING}},
          required: ['email'],
        };
        const validate = ajv.compile(schema);
        expect(validate({email: 'user@example.com'})).toBe(true);
        expect(validate({email: 'test.user+tag@domain.co.uk'})).toBe(true);
      });

      it('rejects invalid email format', () => {
        const schema = {
          type: 'object',
          properties: {email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING}},
          required: ['email'],
        };
        const validate = ajv.compile(schema);
        expect(validate({email: 'notanemail'})).toBe(false);
        expect(validate({email: 'user@'})).toBe(false);
        expect(validate({email: '@example.com'})).toBe(false);
      });

      it('rejects email shorter than minLength (3)', () => {
        const schema = {
          type: 'object',
          properties: {email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING}},
          required: ['email'],
        };
        expect(ajv.compile(schema)({email: 'a@b'})).toBe(false);
      });

      it('rejects email longer than maxLength (255)', () => {
        const schema = {
          type: 'object',
          properties: {email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING}},
          required: ['email'],
        };
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(ajv.compile(schema)({email: longEmail})).toBe(false);
      });

      it('rejects HTML in email', () => {
        const schema = {
          type: 'object',
          properties: {email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING}},
          required: ['email'],
        };
        expect(ajv.compile(schema)({email: 'user<script>@example.com'})).toBe(false);
      });
    });

    describe('UUID_STRING', () => {
      it('allows valid UUIDs', () => {
        const schema = {
          type: 'object',
          properties: {id: {type: 'string' as const, ...VALIDATION_HELPERS.UUID_STRING}},
          required: ['id'],
        };
        expect(ajv.compile(schema)({id: '550e8400-e29b-41d4-a716-446655440000'})).toBe(true);
      });

      it('rejects invalid UUID format', () => {
        const schema = {
          type: 'object',
          properties: {id: {type: 'string' as const, ...VALIDATION_HELPERS.UUID_STRING}},
          required: ['id'],
        };
        const validate = ajv.compile(schema);
        expect(validate({id: 'not-a-uuid'})).toBe(false);
        expect(validate({id: '123'})).toBe(false);
      });

      it('rejects UUID longer than maxLength (36)', () => {
        const schema = {
          type: 'object',
          properties: {id: {type: 'string' as const, ...VALIDATION_HELPERS.UUID_STRING}},
          required: ['id'],
        };
        expect(ajv.compile(schema)({id: '550e8400-e29b-41d4-a716-446655440000-extra'})).toBe(false);
      });
    });

    describe('DATETIME_STRING', () => {
      it('allows valid ISO 8601 datetime', () => {
        const schema = {
          type: 'object',
          properties: {timestamp: {type: 'string' as const, ...VALIDATION_HELPERS.DATETIME_STRING}},
          required: ['timestamp'],
        };
        const validate = ajv.compile(schema);
        expect(validate({timestamp: '2026-03-23T10:30:00Z'})).toBe(true);
        expect(validate({timestamp: '2026-03-23T10:30:00+00:00'})).toBe(true);
      });

      it('rejects invalid datetime format', () => {
        const schema = {
          type: 'object',
          properties: {timestamp: {type: 'string' as const, ...VALIDATION_HELPERS.DATETIME_STRING}},
          required: ['timestamp'],
        };
        const validate = ajv.compile(schema);
        expect(validate({timestamp: '23/03/2026'})).toBe(false);
        expect(validate({timestamp: 'not-a-date'})).toBe(false);
      });

      it('rejects datetime shorter than minLength (4)', () => {
        const schema = {
          type: 'object',
          properties: {timestamp: {type: 'string' as const, ...VALIDATION_HELPERS.DATETIME_STRING}},
          required: ['timestamp'],
        };
        expect(ajv.compile(schema)({timestamp: '123'})).toBe(false);
      });

      it('rejects datetime longer than maxLength (50)', () => {
        const schema = {
          type: 'object',
          properties: {timestamp: {type: 'string' as const, ...VALIDATION_HELPERS.DATETIME_STRING}},
          required: ['timestamp'],
        };
        expect(ajv.compile(schema)({timestamp: '2026-03-23T10:30:00Z'.padEnd(51, 'Z')})).toBe(false);
      });
    });

    describe('SMALL_POSITIVE_NUMBER_HELPER', () => {
      it('allows numbers between 1 and 1000', () => {
        const schema = {
          type: 'object',
          properties: {count: {type: 'number' as const, ...VALIDATION_HELPERS.SMALL_POSITIVE_NUMBER_HELPER}},
          required: ['count'],
        };
        const validate = ajv.compile(schema);
        expect(validate({count: 1})).toBe(true);
        expect(validate({count: 500})).toBe(true);
        expect(validate({count: 1000})).toBe(true);
      });

      it('rejects numbers less than minimum (1)', () => {
        const schema = {
          type: 'object',
          properties: {count: {type: 'number' as const, ...VALIDATION_HELPERS.SMALL_POSITIVE_NUMBER_HELPER}},
          required: ['count'],
        };
        const validate = ajv.compile(schema);
        expect(validate({count: 0})).toBe(false);
        expect(validate({count: -5})).toBe(false);
      });

      it('rejects numbers greater than maximum (1000)', () => {
        const schema = {
          type: 'object',
          properties: {count: {type: 'number' as const, ...VALIDATION_HELPERS.SMALL_POSITIVE_NUMBER_HELPER}},
          required: ['count'],
        };
        expect(ajv.compile(schema)({count: 1001})).toBe(false);
      });
    });

    describe('PAGE_SIZE_NUMBER_HELPER', () => {
      it('uses default value 10 when not provided', () => {
        const schema = {
          type: 'object',
          properties: {pageSize: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER}},
        };
        const result: any = {};
        ajv.compile(schema)(result);
        expect(result.pageSize).toBe(10);
      });

      it('allows numbers between 1 and 50', () => {
        const schema = {
          type: 'object',
          properties: {pageSize: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER}},
        };
        const validate = ajv.compile(schema);
        expect(validate({pageSize: 1})).toBe(true);
        expect(validate({pageSize: 25})).toBe(true);
        expect(validate({pageSize: 50})).toBe(true);
      });

      it('rejects numbers less than minimum (1)', () => {
        const schema = {
          type: 'object',
          properties: {pageSize: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER}},
        };
        expect(ajv.compile(schema)({pageSize: 0})).toBe(false);
      });

      it('rejects numbers greater than maximum (50)', () => {
        const schema = {
          type: 'object',
          properties: {pageSize: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER}},
        };
        expect(ajv.compile(schema)({pageSize: 51})).toBe(false);
      });
    });

    describe('PAGE_NUMBER_HELPER', () => {
      it('uses default value 1 when not provided', () => {
        const schema = {
          type: 'object',
          properties: {page: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER}},
        };
        const result: any = {};
        ajv.compile(schema)(result);
        expect(result.page).toBe(1);
      });

      it('allows numbers between 1 and 10000', () => {
        const schema = {
          type: 'object',
          properties: {page: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER}},
        };
        const validate = ajv.compile(schema);
        expect(validate({page: 1})).toBe(true);
        expect(validate({page: 5000})).toBe(true);
        expect(validate({page: 10000})).toBe(true);
      });

      it('rejects numbers less than minimum (1)', () => {
        const schema = {
          type: 'object',
          properties: {page: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER}},
        };
        expect(ajv.compile(schema)({page: 0})).toBe(false);
      });

      it('rejects numbers greater than maximum (10000)', () => {
        const schema = {
          type: 'object',
          properties: {page: {type: 'number' as const, ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER}},
        };
        expect(ajv.compile(schema)({page: 10001})).toBe(false);
      });
    });
  });

  /**
   * ============================================================================
   * INTEGRATION TESTS - Real-world scenarios
   * ============================================================================
   */
  describe('Real-world scenarios', () => {
    it('rejects common XSS payload: alert injection', () => {
      const schema = {
        type: 'object',
        properties: {
          name: {type: 'string', format: 'noHtmlJs', minLength: 1, maxLength: 255},
        },
        required: ['name'],
      };
      const validate = ajv.compile(schema);

      expect(validate({name: '<img src=x onerror=alert("XSS")>'})).toBe(false);
    });

    it('rejects NoSQL injection attempts', () => {
      const schema = {
        type: 'object',
        properties: {
          username: {type: 'string', format: 'noHtmlJs', minLength: 1, maxLength: 255},
        },
        required: ['username'],
      };
      const validate = ajv.compile(schema);

      expect(validate({username: '{"$ne": null}'})).toBe(false);
    });

    it('allows SQL-like text with noHtmlJs format', () => {
      const schema = {
        type: 'object',
        properties: {
          search: {type: 'string', format: 'noHtmlJs', minLength: 1, maxLength: 1000},
        },
        required: ['search'],
      };
      const validate = ajv.compile(schema);

      expect(validate({search: "'; DROP TABLE users; --"})).toBe(true);
    });

    it('allows command-like text with noHtmlJs format', () => {
      const schema = {
        type: 'object',
        properties: {
          command: {type: 'string', format: 'noHtmlJs', minLength: 1, maxLength: 1000},
        },
        required: ['command'],
      };
      const validate = ajv.compile(schema);

      expect(validate({command: '| cat /etc/passwd'})).toBe(true);
      expect(validate({command: '; rm -rf /'})).toBe(true);
    });

    it('allows legitimate user input with dots, commas, exclamation marks', () => {
      const schema = {
        type: 'object',
        properties: {
          bio: {type: 'string', format: 'safeString', minLength: 1, maxLength: 1000},
        },
        required: ['bio'],
      };
      const validate = ajv.compile(schema);

      expect(validate({bio: 'Hello.World,Im.a.user!'})).toBe(true);
    });

    it('allows mixed content with various safe characters', () => {
      const schema = {
        type: 'object',
        properties: {
          description: {type: 'string', format: 'noHtmlJs', minLength: 1, maxLength: 1000},
        },
        required: ['description'],
      };
      const validate = ajv.compile(schema);

      expect(validate({description: 'Welcome to my profile! I love coding, design, and teaching.'})).toBe(true);
    });

    it('validates complete user creation schema', () => {
      const schema = {
        type: 'object',
        properties: {
          username: {type: 'string', format: 'alphanumeric', minLength: 3, maxLength: 20},
          email: {type: 'string', format: 'email', minLength: 3, maxLength: 255},
          bio: {type: 'string', format: 'noHtmlJs', minLength: 0, maxLength: 500},
          password: {type: 'string', minLength: 6, maxLength: 255},
        },
        required: ['username', 'email', 'password'],
      };
      const validate = ajv.compile(schema);

      // Valid user
      expect(
        validate({
          username: 'JohnDoe123',
          email: 'john@example.com',
          bio: 'Software engineer from New York, USA!',
          password: 'SecurePass123!',
        })
      ).toBe(true);

      // Invalid: HTML in bio
      expect(
        validate({
          username: 'JohnDoe123',
          email: 'john@example.com',
          bio: '<img src=x onerror=alert()>',
          password: 'SecurePass123!',
        })
      ).toBe(false);

      // Invalid: Special chars in username
      expect(
        validate({
          username: 'John@Doe',
          email: 'john@example.com',
          bio: 'Developer',
          password: 'SecurePass123!',
        })
      ).toBe(false);
    });
  });
});
