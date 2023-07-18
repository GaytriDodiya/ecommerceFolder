import data from './data';
import './index.css';
function App() {
  return (
    <div>
      <header>
        <a href="/">Amazone</a>
      </header>
      <main>
        <h1>Featured Products</h1>
        <div className="productsContainer">
          {data.products.map(product => (
            <div className="product" key={product.slug}>
              <a href={`/product/${product.slug}`}>
                <img src={product.image} alt={product.slug} />
              </a>

              <div className="product-info">
                <a href={`/product/${product.slug}`}>
                  <p>{product.name}</p>
                </a>

                <p>&#8377;<strong>{product.price}</strong></p>
                <button>ADD TO CART</button>
              </div>
            </div>

          ))}
        </div>

      </main>
    </div>
  );
}

export default App;
