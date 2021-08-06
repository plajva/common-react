import { useRef } from 'react';
import ReactDay from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils from 'react-day-picker/moment';

import { useTheme } from '../Theme';
import { classNameFind } from '../../utils';

import 'react-day-picker/lib/style.css';
import s from './InputDate.module.scss';

interface InputDateProps {
    name?: string;
    value?: string | Date;
    format?: string | string[];
    placeholder?: string;
    className?: string;
    overlayClassName?: string;
    overlayWrapperClassName?: string;
    onChange?: (e: any) => void;
}

const InputDate = ({
    name,
    format = ['MM/DD/YYYY', 'M/D/YYYY'],
    placeholder = 'mm/dd/yyyy',
    className,
    overlayClassName,
    overlayWrapperClassName,
    onChange,
    value,
}: InputDateProps) => {
    const theme = useTheme().name;
    const ref = useRef<any>(null);

    return (
        <ReactDay
            ref={ref}
            value={value}
            showOverlay={true}
            placeholder={placeholder}
            inputProps={{
                className: classNameFind(s, 'atom', theme) + ' ' + className,
                name,
            }}
            classNames={{
                container: '',
                overlay: classNameFind(s, 'DayPickerInput-Overlay', 'overlay', overlayClassName, theme),
                overlayWrapper: classNameFind(s, 'DayPickerInput-OverlayWrapper', overlayWrapperClassName, theme),
            }}
            format={format}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
            dayPickerProps={{
                localeUtils: MomentLocaleUtils,
            }}
            onDayChange={(date) => {
                onChange && onChange({ target: { name, value: date } });
            }}
            onDayPickerHide={() => {
                if (!value) {
                    if (ref.current) {
                        ref.current.input.value = '';
                        ref.current.state.typedValue = '';
                    }
                }
            }}
        />
    );
};

export default InputDate;
