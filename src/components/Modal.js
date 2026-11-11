import React, {useState, useEffect} from 'react'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import DialogTitle from '@mui/joy/DialogTitle'
import DialogContent from '@mui/joy/DialogContent'

import Styles from './styles/Modal.module.css'

// Тёмное окно с золотой рамкой
const dialogSx = {
    bgcolor: 'var(--card)',
    border: '1.5px solid var(--gold)',
    borderRadius: '16px',
    color: 'var(--text)',
    width: 'calc(100vw - 32px)'
}

const CustomModal = ({title, text, visible, onClose, children}) => {
    const [_visible, setVisible] = useState(visible)

    useEffect(() => {
        if (_visible) {
            setVisible(true)
        }
    }, [visible, _visible])

    const handleClose = () => {
        setVisible(false)
        if (onClose) {
            onClose()
        }
    }

    return <>
        <Modal open={visible} onClose={handleClose}>
        <ModalDialog layout='center' sx={dialogSx}>
            <ModalClose sx={{color: 'var(--gold-light)'}} />
            <DialogTitle sx={{color: 'var(--gold-light)', fontFamily: 'Minion Pro Bold'}}>{title}</DialogTitle>
            <DialogContent>{children || <p className={Styles.text}>{text}</p>}</DialogContent>
        </ModalDialog>
        </Modal>
    </>
}


export default CustomModal