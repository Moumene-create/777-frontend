import { Link } from 'react-router-dom'

function PublicHeader () {
    return(
        <header>
            <p>7.77</p>

            <nav aria-label='Public navigation'>
                <Link to="/login">log in</Link>
                <Link to='/signup'>Creat account</Link>
            </nav>
        </header>
    )
}
export default PublicHeader