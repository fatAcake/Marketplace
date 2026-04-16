namespace backend.DTO
{
    public class PriceHistoryDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public decimal? OldPrice { get; set; }
        public decimal? NewPrice { get; set; }
        public decimal? OldDiscount { get; set; }
        public decimal? NewDiscount { get; set; }
        public DateTime ChangedAt { get; set; }
        public int? ChangedBy { get; set; }
        public string? ChangedByNickname { get; set; }
    }

    public class PriceHistoryCreateDto
    {
        public decimal? NewPrice { get; set; }
        public decimal? NewDiscount { get; set; }
        public string? Comment { get; set; }
    }
}
