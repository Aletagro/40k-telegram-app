import React, {useState, useEffect} from 'react'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import DialogTitle from '@mui/joy/DialogTitle'
import DialogContent from '@mui/joy/DialogContent'

import Styles from './styles/Modal.module.css'

const CustomModal = ({title, text, visible, onClose}) => {
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
        <ModalDialog layout='center'>
            <ModalClose />
            <DialogTitle>{title}</DialogTitle>
            <DialogContent><p id={Styles.text}>{text}</p></DialogContent>
        </ModalDialog>
        </Modal>
    </>
}


export default CustomModal