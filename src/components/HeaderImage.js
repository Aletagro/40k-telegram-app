import React, {useState} from 'react';
import placeholder from '../images/placeholder.png'

const Styles = {
    big: {
        width: '100%',
        aspectRatio: 1.85
    },
    wide: {
        width: '100%',
        aspectRatio: 3.75
    }
}

const HeaderImage = ({src, alt, isWide}) => {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const placeholderStyles = {...isWide ? Styles.wide : Styles.big, ...error ? {} : {position: 'absolute'}}

    const handleImageLoaded = (e) => {
        setLoaded(true)
    }

    const handleError = () => {
        setError(true)
    }

    return <div id='column'>
        {!loaded && <img src={placeholder} alt={alt} style={placeholderStyles}/>}
        {error ? null : <img src={src} alt={alt} style={isWide ? Styles.wide : Styles.big} onLoad={handleImageLoaded} onError={handleError}/>}
    </div>
}

export default HeaderImage