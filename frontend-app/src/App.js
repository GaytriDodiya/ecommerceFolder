
import './index.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screen/HomeScreen';
import ProductScreen from './screen/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/esm/Badge';
import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext } from 'react';
import { Store } from './Store';
import CartScreen from './screen/CartScreen';
import SignInScreen from './screen/SignInScreen';
import NavDropDown from 'react-bootstrap/NavDropdown';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screen/ShippingAddressScreen';
import SignupScreen from './screen/SignUpScreen';
import PaymentMethodScreen from './screen/PaymentMethodScreen';
import PlaceOrderScreen from './screen/PlaceOrderScreen';
import OrderScreen from './screen/OrderScreen';
import OrderHistoryScreen from './screen/OrderHistoryScreen';
import NavbarCollapse from 'react-bootstrap/esm/NavbarCollapse';
import ProfileScreen from './screen/ProfileScreen';
function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const SignOutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  }
  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
        <header>
          <ToastContainer position="bottom-center" limit={1} />
          <Navbar bg='dark' variant='dark' expand="lg">
            <Container className='mt-3'>
              <LinkContainer to="/" >
                <Navbar.Brand>   Amazone   </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls='basic-navbar-nav' />
              <NavbarCollapse id='basic-navbar-nav'>
                <Nav className="me-auto w-100 justify-content-end" >
                  <Link to="/cart" className='nav-link'>
                    cart
                    {
                      cart.cartItem.length > 0 && (<Badge pill bg="danger">
                        {/* {cart.cartItem.length} */}
                        {cart.cartItem.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>)
                    }
                  </Link>
                  {userInfo ? (
                    <NavDropDown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropDown.Item >User Profile</NavDropDown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropDown.Item >Order History</NavDropDown.Item>
                      </LinkContainer>
                      <NavDropDown.Divider />
                      <Link className='dropdown-item' to="#signout" onClick={SignOutHandler}>Sign Out </Link>
                    </NavDropDown>
                  ) : (
                    <Link className="nav-link" to="/signin">Sign In</Link>
                  )}
                </Nav>
              </NavbarCollapse>
            </Container>
          </Navbar >
        </header>
        <main>
          <Container>
            <Routes>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path='/payment' element={<PaymentMethodScreen />} />
              <Route path="/" element={<HomeScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path='/signin' element={<SignInScreen />} />

              <Route path='/shipping' element={<ShippingAddressScreen />} />
              <Route path='/signup' element={<SignupScreen />} />
              <Route path='/profile' element={<ProfileScreen />} />
              <Route path='/placeorder' element={<PlaceOrderScreen />} />
              <Route path='/order/:id' element={<OrderScreen />} />
              <Route path='/orderhistory' element={<OrderHistoryScreen />} />

            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center">all rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
