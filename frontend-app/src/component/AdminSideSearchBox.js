import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate } from 'react-router-dom';
function AdminSideSearchBox() {
    // search 
    const navigate = useNavigate();
    const [searchQuery, SetSearchQuery] = useState('');
    const SearchHadler = async (e) => {
        e.preventDefault();
        if (searchQuery) {
            navigate(`/admin/search/?query=${searchQuery}`)
        }
        else {
            navigate(`/search`)
        }
    }
    return (
        <div>
            <Form onSubmit={SearchHadler}>
                <InputGroup>
                    <Form.Control type='text' placeholder='Search Product' value={searchQuery}
                        onChange={(e) => SetSearchQuery(e.target.value)} />
                    <Button type='submit'> <i className='fas fa-search'></i></Button>
                </InputGroup>
            </Form>
        </div>
    )
}

export default AdminSideSearchBox
