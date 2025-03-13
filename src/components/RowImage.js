import React, {useState} from 'react';
import placeholder from '../images/placeholder.png'

const containerStyle = {
    borderRadius: 4,
    width: 40,
    height: 64,
    marginRight: 12
}

const style = {
    borderRadius: 4,
    width: 40,
    height: 64
}

const RowImage = ({src, alt}) => {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const placeholderStyles = {...style, ...error ? {} : {position: 'absolute'}}

    const handleImageLoaded = (e) => {
        setLoaded(true)
    }

    const handleError = () => {
        setError(true)
    }

    return <div style={containerStyle}>
        {!loaded && <img src={placeholder} alt={alt} style={placeholderStyles}/>}
        {error ? null : <img src={src} alt={alt} style={style} onLoad={handleImageLoaded} onError={handleError}/>}
    </div>
}

export default RowImage