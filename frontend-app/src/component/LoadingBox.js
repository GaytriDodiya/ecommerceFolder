import Spinner from 'react-bootstrap/Spinner';

export default function LoadingBox() {
    return (
        <div className='SpinnerContainer'>
            <Spinner animation="border" role="status">
                <span className="visually-hidden"></span>
            </Spinner>
        </div>

    );
}