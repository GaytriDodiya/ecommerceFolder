
import './index.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screen/HomeScreen';
import ProductScreen from './screen/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/esm/Badge';
import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screen/CartScreen';
import SignInScreen from './screen/SignInScreen';
import NavDropDown from 'react-bootstrap/NavDropdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screen/ShippingAddressScreen';
import SignupScreen from './screen/SignUpScreen';
import PaymentMethodScreen from './screen/PaymentMethodScreen';
import PlaceOrderScreen from './screen/PlaceOrderScreen';
import OrderScreen from './screen/OrderScreen';
import OrderHistoryScreen from './screen/OrderHistoryScreen';
import ProfileScreen from './screen/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './component/SearchBox';
import SearchScreen from './screen/SearchScreen';
import ProtectedRoute from './component/ProtectedRoute';
import DashbordScreen from './screen/DashbordScreen';
import AdminRoute from './component/AdminRoutes';
import ProductListScreen from './screen/ProductListScreen';
import ProductEditScreen from './screen/ProductEditScreen';
import OrderListScreen from './screen/OrderListScreen';
import UserListScreen from './screen/UserListScreen';
import UserEditScreen from './screen/UserEditScreen';
import MapScreen from './screen/MapScreen';
import ForgetPasswordScreen from './screen/ForgetPasswordScreen';
import ResetPasswordScreen from './screen/ResetPasswordScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo, fullBox } = state;
  const SignOutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  }
  const [sidebarIsOpen, setSidebarIsopen] = useState(false);
  const [categories, setCategories] = useState([]);
  console.log(categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories')
        setCategories(data)
      } catch (error) {
        toast.error(getError(error));

      }
    }
    fetchCategories();
  }, [])
  return (
    <BrowserRouter>
      <div className={sidebarIsOpen ? fullBox
        ? 'site-container active-cont d-flex flex-column full-box'
        : 'site-container active-cont d-flex flex-column'
        : fullBox
          ? 'site-container d-flex flex-column full-box'
          : 'site-container d-flex flex-column'}>
        {/* //  'd-flex flex-column site-container active-cont'
        //   : 'd-flex flex-column site-container'}> */}
        <header>
          <ToastContainer position="bottom-center" limit={1} />
          <Navbar bg='dark' variant='dark' expand="lg">
            <Container>
              <Button variant="dark" onClick={() => setSidebarIsopen(!sidebarIsOpen)}>
                <i className='fas fa-bars'></i>
              </Button>
              <LinkContainer to="/" >
                <Navbar.Brand>   Amazone   </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls='basic-navbar-nav' />
              <Navbar.Collapse id='basic-navbar-nav'>
                {/* ---------------search box------------ */}
                <SearchBox />
                <Nav className="me-auto w-100 justify-content-end" >
                  <Link to="/cart" className='nav-link'>
                    Cart
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
                  {userInfo && userInfo.isAdmin && (
                    <NavDropDown title="Admin" id="adimh-nav-dropdown">
                      <LinkContainer to='/admin/dashbord'>
                        <NavDropDown.Item>Dhashbord</NavDropDown.Item>
                      </LinkContainer>
                      <LinkContainer to='/admin/products'><NavDropDown.Item>Products</NavDropDown.Item></LinkContainer>
                      <LinkContainer to='/admin/orders'><NavDropDown.Item>Orders</NavDropDown.Item></LinkContainer>
                      <LinkContainer to='/admin/users'><NavDropDown.Item>Users</NavDropDown.Item></LinkContainer>
                    </NavDropDown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar >
        </header>
        <div className={sidebarIsOpen
          ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
          : 'side-navbar d-flex justify-content-between flex-wrap flex-column'} >
          {userInfo && userInfo.isAdmin ? (
            <Nav className="flex-column text-white w-100 p-2 mt-2">
              <Nav.Item>
                <strong><i className='fas fa-user-lock mr-1'></i>Admin Panel</strong>
                <LinkContainer to='/admin/dashbord'><NavDropDown.Item className='text-white'>  Dhashbord</NavDropDown.Item></LinkContainer>
                <LinkContainer to='/admin/products'><NavDropDown.Item className='text-white'>Products</NavDropDown.Item></LinkContainer>
                <LinkContainer to='/admin/orders'><NavDropDown.Item className='text-white'>Orders</NavDropDown.Item></LinkContainer>
                <LinkContainer to='/admin/users'><NavDropDown.Item className='text-white'>Users</NavDropDown.Item></LinkContainer>
              </Nav.Item>
            </Nav>
          ) : (
            <Nav className="flex-column text-white w-100 p-2">
              <Nav.Item>
                <strong>Categories</strong>
              </Nav.Item>
              {categories.map((category) => (
                <Nav.Item key={category}>
                  <LinkContainer
                    to={{ pathname: '/search', search: `?category=${category}` }}
                    onClick={() => setSidebarIsopen(false)} >
                    <Nav.Link>{category}</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              ))}
            </Nav>
          )}

        </div>
        {/* <div>{userInfo.isAdmin }</div> */}
        <main>
          <Container className='mt-3' >
            <Routes>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path='/payment' element={<PaymentMethodScreen />} />
              <Route path="/" element={<HomeScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path='/signin' element={<SignInScreen />} />
              <Route path='/search' element={<SearchScreen />} />
              <Route path='/shipping' element={<ShippingAddressScreen />} />
              <Route path='/signup' element={<SignupScreen />} />
              <Route path='/profile' element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
              <Route path='/placeorder' element={<ProtectedRoute><PlaceOrderScreen /></ProtectedRoute>} />
              <Route path='/order/:id' element={<ProtectedRoute><OrderScreen /></ProtectedRoute>} />
              <Route path='/orderhistory' element={<ProtectedRoute><OrderHistoryScreen /></ProtectedRoute>} />
              <Route path='/admin/dashbord' element={<AdminRoute><DashbordScreen /></AdminRoute>} />
              <Route path='/admin/products' element={<AdminRoute><ProductListScreen /></AdminRoute>} />
              <Route path='/admin/product/:id' element={<AdminRoute><ProductEditScreen /></AdminRoute>} />
              <Route path='/admin/orders' element={<AdminRoute><OrderListScreen /></AdminRoute>} />
              <Route path='/admin/users' element={<AdminRoute><UserListScreen /></AdminRoute>} />
              <Route path='/admin/user/:id' element={<AdminRoute><UserEditScreen /></AdminRoute>} />
              <Route path='/map' element={<><MapScreen /></>} />
              <Route path='/forget-password' element={<ForgetPasswordScreen />} />
              <Route path='/reset-password/:token' element={<ResetPasswordScreen />} />
              <Route path='/admin/search' element={<ProductListScreen />} />
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
