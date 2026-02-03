namespace LahanShop.Models
{
    public class CategorySpecification
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

    }
}
