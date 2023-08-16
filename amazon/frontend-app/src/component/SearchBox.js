import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
const SearchBox = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const SearchHandler = (e) => {
        e.preventDefault();
        if (query) {
            // navigate({ pathname: `/search/?query=${query}`, search: "searchstring" })
            navigate(`/search/?query=${query}`);
        }
        else {
            navigate("/search")
        }
    }
    // }
    // navigate(`/search/?query=${query}:'/search`);
    // }
    return (
        <div>
            <Form className="d-flex me-auto" onSubmit={SearchHandler}>
                <InputGroup>
                    <Form.Control type="text" name="q" id="q" onChange={(e) => setQuery(e.target.value)} placeholder="Search Product" />
                    <Button className="btn-outline-primary" type="submit" id="button-search">
                        <i className='fas fa-search'></i>
                    </Button>
                </InputGroup>

            </Form>
        </div>
    )
}

export default SearchBox;
