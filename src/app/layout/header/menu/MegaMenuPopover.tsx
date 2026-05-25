import React, { useMemo, useRef, useState } from 'react';
import { ChevronDownIcon as ChevronDown } from '@/icons';
import { useT } from '@/i18n/useT';
import { MenuItem as MenuEntry } from './components/MegaMenuItem';
import { menuData } from './utils/menu-data';
import { usePopoverPosition } from './utils/menu.hooks';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectTenantMenu } from '@/features/tenant/redux/tenant.selectors';
import type { MenuItem as LayoutMenuItem } from './utils/menu.types';
import { collectAllowedPaths, filterMenuByAllowedPaths } from './utils/menu.utils';

export const MegaMenuPopover: React.FC = (): React.ReactElement => {
  const { t } = useT('common');
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverPosition = usePopoverPosition(isOpen, buttonRef);
  const tenantMenu = useAppSelector(selectTenantMenu);

  const visibleMenuByIndex: Array<LayoutMenuItem | undefined> = useMemo(() => {
    if (tenantMenu === undefined) {
      return menuData;
    }

    const allowedPaths = collectAllowedPaths(tenantMenu);
    return filterMenuByAllowedPaths(menuData, allowedPaths);
  }, [tenantMenu]);

  const handleButtonMouseLeave = (): void => {
    setTimeout(() => {
      if (!popoverRef.current?.matches(':hover') && !buttonRef.current?.matches(':hover')) {
        setIsOpen(false);
      }
    }, 100);
  };

  const renderItem = (index: number, highlighted = false): React.ReactNode => {
    const item = visibleMenuByIndex[index];
    if (!item) {
      return null;
    }

    return <MenuEntry menu={item} highlighted={highlighted} onMenuClose={() => setIsOpen(false)} />;
  };

  return (
    <div className="bg-surface">
      <div className="max-w-4xl mx-auto">
        <button
          ref={buttonRef}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={handleButtonMouseLeave}
          className="px-6 py-3 bg-primary text-text-inverted rounded-lg shadow-lg hover:bg-primary-hover transition-colors font-medium"
        >
          {t('nav.menu')}{' '}
          <ChevronDown
            className={`inline-block w-4 h-4 ms-2 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            onMouseLeave={() => setIsOpen(false)}
            className="fixed w-[1400px] max-w-[calc(100vw-20px)] bg-surface-elevated rounded-lg shadow-2xl z-50 border border-border overflow-visible"
            style={{
              left: `${popoverPosition.left}px`,
              top: `${popoverPosition.top}px`,
            }}
          >
            {/* Menu Header */}
            <div className="bg-primary text-text-inverted px-4 py-3 font-semibold text-lg flex items-center">
              <ChevronDown className="w-5 h-5 me-2" />
              {t('nav.menu')}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-4 divide-x divide-border">
              <div className="p-2">
                {renderItem(0)}
                {renderItem(3)}
                {renderItem(5)}
                {renderItem(6)}
                {renderItem(7)}
                {renderItem(8)}
                {renderItem(9)}
                {renderItem(10)}
              </div>

              {/* Highlighted column */}
              <div className="p-2 bg-surface-muted">{renderItem(1, true)}</div>

              <div className="p-2">{renderItem(2)}</div>

              <div className="p-2">{renderItem(4)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

