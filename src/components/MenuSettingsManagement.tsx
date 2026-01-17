import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MenuSetting {
  id: string;
  menu_key: string;
  menu_label: string;
  is_enabled: boolean;
  order_index: number;
}

export default function MenuSettingsManagement() {
  const [menus, setMenus] = useState<MenuSetting[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const { data } = await supabase
      .from('menu_settings')
      .select('*')
      .order('order_index');

    if (data) {
      setMenus(data);
      setHasChanges(false);
    }
  };

  const toggleEnabled = (id: string) => {
    setMenus(prev => prev.map(menu =>
      menu.id === id ? { ...menu, is_enabled: !menu.is_enabled } : menu
    ));
    setHasChanges(true);
  };

  const updateLabel = (id: string, label: string) => {
    setMenus(prev => prev.map(menu =>
      menu.id === id ? { ...menu, menu_label: label } : menu
    ));
    setHasChanges(true);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newMenus = [...menus];
    [newMenus[index - 1], newMenus[index]] = [newMenus[index], newMenus[index - 1]];
    newMenus.forEach((menu, idx) => {
      menu.order_index = idx + 1;
    });
    setMenus(newMenus);
    setHasChanges(true);
  };

  const moveDown = (index: number) => {
    if (index === menus.length - 1) return;
    const newMenus = [...menus];
    [newMenus[index], newMenus[index + 1]] = [newMenus[index + 1], newMenus[index]];
    newMenus.forEach((menu, idx) => {
      menu.order_index = idx + 1;
    });
    setMenus(newMenus);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updates = menus.map(menu =>
      supabase
        .from('menu_settings')
        .update({
          menu_label: menu.menu_label,
          is_enabled: menu.is_enabled,
          order_index: menu.order_index
        })
        .eq('id', menu.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      alert('Error updating menu settings');
      return;
    }

    alert('Menu settings saved successfully');
    loadMenus();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Menu Settings</h2>
          <p className="text-sm text-slate-600 mt-1">
            Control which menus are visible and their order
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Menu Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Menu Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {menus.map((menu, index) => (
              <tr key={menu.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {menu.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {menu.menu_key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={menu.menu_label}
                    onChange={(e) => updateLabel(menu.id, e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded focus:border-slate-500 focus:outline-none text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleEnabled(menu.id)}
                    className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full transition ${
                      menu.is_enabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {menu.is_enabled ? (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <MoveUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === menus.length - 1}
                      className="text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <MoveDown className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}
    </div>
  );
}
