'use strict';

const { paymentMethodsEnum } = require('./20240413115916-create-sale');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove paymentMethod from Sales
    await queryInterface.removeColumn('Sales', 'paymentMethod');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Sales_paymentMethod";');

    // Create SalePayments table
    await queryInterface.createTable('SalePayments', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      saleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sales',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      paymentMethod: {
        allowNull: false,
        type: Sequelize.ENUM(...paymentMethodsEnum),
        defaultValue: paymentMethodsEnum[0],
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });

    // Add restrictions to ensure all sum of payment methods in SalePayments equals total of Sales variations + combos amounts
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION validate_sale_payments() RETURNS trigger AS $$
      DECLARE
        total_sale_amount DECIMAL;
        total_payment_amount DECIMAL;
        v_sale_id UUID;
      BEGIN
        IF TG_TABLE_NAME = 'Sales' THEN
          v_sale_id := COALESCE(NEW.id, OLD.id);
        ELSE
          v_sale_id := COALESCE(NEW."saleId", OLD."saleId");
        END IF;

        IF v_sale_id IS NULL THEN
          IF TG_OP = 'DELETE' THEN
            RETURN OLD;
          END IF;
          RETURN NEW;
        END IF;

        SELECT
          COALESCE(
            (
              SELECT SUM(sp.quantity * v."sellingPrice")
              FROM "SaleProducts" sp
              JOIN "Variations" v ON sp."variationId" = v.id
              WHERE sp."saleId" = v_sale_id
            ),
            0
          )
          + COALESCE(
            (
              SELECT SUM(sm.quantity * m."sellingPrice")
              FROM "SaleCombos" sm
              JOIN "Combos" m ON sm."comboId" = m.id
              WHERE sm."saleId" = v_sale_id
            ),
            0
          )
        INTO total_sale_amount;

        SELECT COALESCE(SUM(amount), 0)
        INTO total_payment_amount
        FROM "SalePayments"
        WHERE "saleId" = v_sale_id;

        IF total_payment_amount <> total_sale_amount THEN
          RAISE EXCEPTION 'Total payment amount (%) does not match total sale amount (%) for sale ID %', total_payment_amount, total_sale_amount, v_sale_id;
        END IF;

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Register triggers for Sales table actions
    await queryInterface.sequelize.query(`
      CREATE CONSTRAINT TRIGGER validate_payments_sales_trigger
      AFTER INSERT ON "Sales"
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION validate_sale_payments();
    `);

    // Register triggers for SalePayments table actions
    await queryInterface.sequelize.query(`
      CREATE CONSTRAINT TRIGGER validate_payments_sale_payments_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "SalePayments"
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION validate_sale_payments();
    `);

    // Register triggers for SaleProducts table actions
    await queryInterface.sequelize.query(`
      CREATE CONSTRAINT TRIGGER validate_payments_sale_products_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "SaleProducts"
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION validate_sale_payments();
    `);

    // Register triggers for SaleCombos table actions
    await queryInterface.sequelize.query(`
      CREATE CONSTRAINT TRIGGER validate_payments_sale_combos_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "SaleCombos"
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION validate_sale_payments();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS validate_payments_sales_trigger ON "Sales";');
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS validate_payments_sale_payments_trigger ON "SalePayments";'
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS validate_payments_sale_products_trigger ON "SaleProducts";'
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS validate_payments_sale_combos_trigger ON "SaleCombos";'
    );
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS validate_sale_payments();');
    await queryInterface.dropTable('SalePayments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_SalePayments_paymentMethod";');
    await queryInterface.addColumn('Sales', 'paymentMethod', {
      allowNull: false,
      type: Sequelize.ENUM(...paymentMethodsEnum),
      defaultValue: paymentMethodsEnum[0],
    });
  },
};
