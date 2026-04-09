using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class dedede2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceDiscountHistory_products_Productsid",
                table: "PriceDiscountHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PriceDiscountHistory",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "ChangedBy",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "NewDiscount",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "NewPrice",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "OldDiscount",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "OldPrice",
                table: "PriceDiscountHistory");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "PriceDiscountHistory");

            migrationBuilder.RenameTable(
                name: "PriceDiscountHistory",
                newName: "price_discount_history");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "price_discount_history",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "Productsid",
                table: "price_discount_history",
                newName: "product_id");

            migrationBuilder.RenameColumn(
                name: "ChangedAt",
                table: "price_discount_history",
                newName: "changed_at");

            migrationBuilder.RenameIndex(
                name: "IX_PriceDiscountHistory_Productsid",
                table: "price_discount_history",
                newName: "IX_price_discount_history_product_id");

            migrationBuilder.AddColumn<int>(
                name: "changed_by",
                table: "price_discount_history",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "new_discount",
                table: "price_discount_history",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "new_price",
                table: "price_discount_history",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "old_discount",
                table: "price_discount_history",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "old_price",
                table: "price_discount_history",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_price_discount_history",
                table: "price_discount_history",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_price_discount_history_changed_by",
                table: "price_discount_history",
                column: "changed_by");

            migrationBuilder.AddForeignKey(
                name: "FK_price_discount_history_products_product_id",
                table: "price_discount_history",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_price_discount_history_users_changed_by",
                table: "price_discount_history",
                column: "changed_by",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_price_discount_history_products_product_id",
                table: "price_discount_history");

            migrationBuilder.DropForeignKey(
                name: "FK_price_discount_history_users_changed_by",
                table: "price_discount_history");

            migrationBuilder.DropPrimaryKey(
                name: "PK_price_discount_history",
                table: "price_discount_history");

            migrationBuilder.DropIndex(
                name: "IX_price_discount_history_changed_by",
                table: "price_discount_history");

            migrationBuilder.DropColumn(
                name: "changed_by",
                table: "price_discount_history");

            migrationBuilder.DropColumn(
                name: "new_discount",
                table: "price_discount_history");

            migrationBuilder.DropColumn(
                name: "new_price",
                table: "price_discount_history");

            migrationBuilder.DropColumn(
                name: "old_discount",
                table: "price_discount_history");

            migrationBuilder.DropColumn(
                name: "old_price",
                table: "price_discount_history");

            migrationBuilder.RenameTable(
                name: "price_discount_history",
                newName: "PriceDiscountHistory");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "PriceDiscountHistory",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "product_id",
                table: "PriceDiscountHistory",
                newName: "Productsid");

            migrationBuilder.RenameColumn(
                name: "changed_at",
                table: "PriceDiscountHistory",
                newName: "ChangedAt");

            migrationBuilder.RenameIndex(
                name: "IX_price_discount_history_product_id",
                table: "PriceDiscountHistory",
                newName: "IX_PriceDiscountHistory_Productsid");

            migrationBuilder.AddColumn<int>(
                name: "ChangedBy",
                table: "PriceDiscountHistory",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "NewDiscount",
                table: "PriceDiscountHistory",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NewPrice",
                table: "PriceDiscountHistory",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OldDiscount",
                table: "PriceDiscountHistory",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OldPrice",
                table: "PriceDiscountHistory",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "PriceDiscountHistory",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PriceDiscountHistory",
                table: "PriceDiscountHistory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceDiscountHistory_products_Productsid",
                table: "PriceDiscountHistory",
                column: "Productsid",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
