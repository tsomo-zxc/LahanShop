namespace LahanShop.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ProductsCount { get; set; }
        public int? ParentId { get; set; } 
        public string? ParentName { get; set; }
    }
}
