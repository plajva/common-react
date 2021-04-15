import React, { FunctionComponent, ReactNode, useContext, useState } from 'react';
import s from './Dropdown.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface DropdownProps {
  /**Wether to use css hover or javascript, true for javascript*/
  on_click?: boolean;
  /**Wether to handle click or not */
  handle_click?: boolean;
}
/**
 * Gets two children either functions or components, if functions, then call with (state, setState) arguments
 * @param param0
 */
const Dropdown: FunctionComponent<DropdownProps & React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  on_click,
  handle_click,
  children,
  ...props
}) => {
  const theme = useTheme().name;
  const [state, setState] = useState({ open: on_click ? false : true });
  className = classNameFind(s, `comp`, theme, className, 'dropdown');
  // Default to true if handleclick is undefined
  handle_click = typeof handle_click === 'undefined' ? true : handle_click;

  const _children = Array.isArray(children) ? [...children] : [children];
  let child_first: ReactNode;
  if (_children.length) {
    child_first = _children.splice(0, 1);
  }
  const child_rest = _children;
  const renderChild = (child) => {
    const _render = (v) => (typeof v === 'function' ? v(state, setState) : v);
    return Array.isArray(child) ? child.map((v) => _render(v)) : _render(child);
  };

  return (
    <div className={className} {...props}>
      <div
        className={classNameFind(s, 'dropbtn')}
        onClick={on_click && handle_click ? () => setState({ open: !state.open }) : () => {}}
      >
        {renderChild(child_first)}
      </div>

      {state.open && (
        <div className={classNameFind(s, 'dropdown-content', !on_click ? 'dropdown-content-hover' : '')}>
          {renderChild(child_rest)}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
