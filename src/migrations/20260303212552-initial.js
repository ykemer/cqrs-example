'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {type: Sequelize.STRING, allowNull: false, unique: true},
      name: {type: Sequelize.STRING, allowNull: false},
      password: {type: Sequelize.STRING, allowNull: false},
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Courses
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {type: Sequelize.STRING, allowNull: false},
      description: {type: Sequelize.TEXT, allowNull: false},
      enrolled_users: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
      created_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
      updated_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
    });

    // Classes (belongs to course)
    await queryInterface.createTable('classes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      registration_deadline: {type: Sequelize.DATE, allowNull: false},
      start_date: {type: Sequelize.DATE, allowNull: false},
      end_date: {type: Sequelize.DATE, allowNull: false},
      enrolled_users: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
      max_users: {type: Sequelize.INTEGER, allowNull: false},
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'courses', key: 'id'},
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
      updated_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
    });

    // Enrollments (many-to-many user <> class)
    await queryInterface.createTable('enrollments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      class_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'classes', key: 'id'},
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      enrolled_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
    });

    await queryInterface.addIndex('enrollments', ['user_id']);
    await queryInterface.addIndex('enrollments', ['class_id']);
    await queryInterface.addIndex('enrollments', ['user_id', 'class_id'], {unique: true});

    // Refresh tokens
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      token: {type: Sequelize.STRING, allowNull: false, unique: true},
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      expires_at: {type: Sequelize.DATE, allowNull: false},
      created_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
      updated_at: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()')},
      revoked: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
      revoked_at: {type: Sequelize.DATE, allowNull: true},
    });

    await queryInterface.addIndex('refresh_tokens', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect FK constraints
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.removeIndex('enrollments', ['user_id', 'class_id']);
    await queryInterface.removeIndex('enrollments', ['class_id']);
    await queryInterface.removeIndex('enrollments', ['user_id']);
    await queryInterface.dropTable('enrollments');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('courses');
    await queryInterface.dropTable('users');

    // Drop ENUM type if it exists (Postgres)
    try {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    } catch (e) {
      // ignore
    }
  },
};
