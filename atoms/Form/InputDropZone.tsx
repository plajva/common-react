import { useState } from 'react';
import { FiUpload, FiMoreVertical } from 'react-icons/fi';
import { RiDragDropLine } from 'react-icons/ri';
import DropZone, { DropzoneOptions } from 'react-dropzone';

import Icon from '../Icon';
import s from './InputDropZone.module.scss';

interface InputDropZoneProps {
    listMaxFiles?: number;
    labelEmpty?: string;
    classNameFiles?: string;
}

const InputDropZone = ({
    labelEmpty,
    listMaxFiles,
    classNameFiles,
    onDrop,
    ...props
}: InputDropZoneProps & DropzoneOptions) => {
    const [files, setFiles] = useState<Array<File>>([]);

    const onDropChange = (accepted, rejected, event) => {
        setFiles(accepted);
        onDrop && onDrop(accepted, rejected, event);
    };

    return (
        <DropZone onDrop={onDropChange} {...props}>
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className={s.dropzone}>
                    <input {...getInputProps()} name='files' />
                    {files.length > 0 ? (
                        <Icon icon={FiUpload} style={{ fontSize: 'small' }} />
                    ) : (
                        <Icon icon={RiDragDropLine} style={{ fontSize: '2em' }} />
                    )}
                    {files.length === 0 && <label>{labelEmpty}</label>}
                    {files.length > 0 && (
                        <div style={{ width: '100%' }}>
                            {files
                                .slice(0, listMaxFiles && listMaxFiles > 2 ? listMaxFiles - 2 : undefined)
                                .map((file, index) => (
                                    // <div key={index} item className={classes.file}>
                                    //     <Avatar
                                    //         className={classes.fileAvatar}
                                    //         title={file.name}
                                    //         src={base64[`f${index}`]}
                                    //         alt={file.name.slice(0, 2)}
                                    //     >
                                    //         {PickIcon(file.type)}
                                    //     </Avatar>
                                    // </div>
                                    <div className={classNameFiles}>
                                        <label>{file.name}</label>
                                    </div>
                                ))}
                            {listMaxFiles && listMaxFiles > 2 && files.length > listMaxFiles - 1 ? (
                                <>
                                    <div style={{ textAlign: 'center' }}>
                                        <Icon icon={FiMoreVertical} />
                                    </div>
                                    <div className={classNameFiles}>
                                        <label>{files[files.length - 1].name}</label>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </DropZone>
    );
};

export default InputDropZone;
