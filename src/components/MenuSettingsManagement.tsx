import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, MoveUp, MoveDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MenuSetting {
  id: string;
  menu_key: string;
  menu_label: string;
  menu_label_tamil: string;
  is_enabled: boolean;
  order_index: number;
  parent_key: string | null;
}

interface AddForm {
  menu_key: string;
  menu_label: string;
  menu_label_tamil: string;
  parent_key: string;
}

const EMPTY_FORM: AddForm = { menu_key: '', menu_label: '', menu_label_tamil: '', parent_key: '' };

export default function MenuSettingsManagement() {
  const [menus, setMenus] = useState<MenuSetting[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

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

  const topLevel = menus.filter(m => !m.parent_key);

  const childrenOf = (key: string) =>
    menus.filter(m => m.parent_key === key).sort((a, b) => a.order_index - b.order_index);

  const topLevelKeys = topLevel.map(m => m.menu_key);

  const updateMenu = (id: string, patch: Partial<MenuSetting>) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    setHasChanges(true);
  };

  const moveTopLevel = (index: number, dir: -1 | 1) => {
    const top = [...topLevel];
    const target = index + dir;
    if (target < 0 || target >= top.length) return;
    [top[index], top[target]] = [top[target], top[index]];
    const reindexed = top.map((m, i) => ({ ...m, order_index: i + 1 }));
    setMenus(prev => {
      const children = prev.filter(m => m.parent_key);
      return [...reindexed, ...children];
    });
    setHasChanges(true);
  };

  const moveChild = (parentKey: string, index: number, dir: -1 | 1) => {
    const kids = childrenOf(parentKey);
    const target = index + dir;
    if (target < 0 || target >= kids.length) return;
    const newKids = [...kids];
    [newKids[index], newKids[target]] = [newKids[target], newKids[index]];
    const reindexed = newKids.map((m, i) => ({ ...m, order_index: i + 1 }));
    setMenus(prev => {
      const others = prev.filter(m => m.parent_key !== parentKey);
      return [...others, ...reindexed];
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = menus.map(menu =>
      supabase
        .from('menu_settings')
        .update({
          menu_label: menu.menu_label,
          menu_label_tamil: menu.menu_label_tamil,
          is_enabled: menu.is_enabled,
          order_index: menu.order_index,
        })
        .eq('id', menu.id)
    );

    const results = await Promise.all(updates);
    setSaving(false);

    if (results.some(r => r.error)) {
      alert('Error saving menu settings. Please try again.');
      return;
    }

    await loadMenus();
  };

  const handleAdd = async () => {
    setAddError('');
    const key = addForm.menu_key.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key) { setAddError('Menu key is required.'); return; }
    if (!addForm.menu_label.trim()) { setAddError('English label is required.'); return; }
    if (menus.some(m => m.menu_key === key)) { setAddError(`Key "${key}" already exists.`); return; }

    const parentKey = addForm.parent_key || null;
    const siblings = parentKey
      ? menus.filter(m => m.parent_key === parentKey)
      : menus.filter(m => !m.parent_key);
    const nextIndex = siblings.length + 1;

    setAdding(true);
    const { error } = await supabase.from('menu_settings').insert({
      menu_key: key,
      menu_label: addForm.menu_label.trim(),
      menu_label_tamil: addForm.menu_label_tamil.trim() || null,
      is_enabled: true,
      order_index: nextIndex,
      parent_key: parentKey,
    });
    setAdding(false);

    if (error) {
      setAddError('Failed to add menu item. Please try again.');
      return;
    }

    setAddForm(EMPTY_FORM);
    setShowAddForm(false);
    await loadMenus();
  };

  const handleDelete = async (menu: MenuSetting) => {
    const kids = childrenOf(menu.menu_key);
    const confirmMsg = kids.length > 0
      ? `Delete "${menu.menu_label}" and its ${kids.length} sub-item(s)?`
      : `Delete "${menu.menu_label}"?`;
    if (!window.confirm(confirmMsg)) return;

    const ids = [menu.id, ...kids.map(k => k.id)];
    await supabase.from('menu_settings').delete().in('id', ids);
    await loadMenus();
  };

  const renderRow = (
    menu: MenuSetting,
    index: number,
    total: number,
    isChild: boolean,
    onUp: () => void,
    onDown: () => void
  ) => (
    <tr key={menu.id} className={`hover:bg-slate-50 ${isChild ? 'bg-slate-50/60' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 w-10">
        {menu.order_index}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        <div className="flex items-center space-x-1.5">
          {isChild && <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0 ml-2" />}
          <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
            isChild
              ? 'bg-slate-100 text-slate-500'
              : 'bg-slate-200 text-slate-700 font-semibold'
          }`}>
            {menu.menu_key}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={menu.menu_label}
          onChange={(e) => updateMenu(menu.id, { menu_label: e.target.value })}
          className="w-full px-2.5 py-1 border border-slate-300 rounded focus:border-slate-500 focus:outline-none text-sm"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={menu.menu_label_tamil || ''}
          onChange={(e) => updateMenu(menu.id, { menu_label_tamil: e.target.value })}
          className="w-full px-2.5 py-1 border border-slate-300 rounded focus:border-slate-500 focus:outline-none text-sm"
          placeholder="தமிழ் பெயர்"
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => updateMenu(menu.id, { is_enabled: !menu.is_enabled })}
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full transition ${
            menu.is_enabled
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {menu.is_enabled
            ? <><Eye className="h-3 w-3" /><span>Visible</span></>
            : <><EyeOff className="h-3 w-3" /><span>Hidden</span></>
          }
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={onUp}
            disabled={index === 0}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed rounded hover:bg-slate-100 transition"
            title="Move up"
          >
            <MoveUp className="h-4 w-4" />
          </button>
          <button
            onClick={onDown}
            disabled={index === total - 1}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed rounded hover:bg-slate-100 transition"
            title="Move down"
          >
            <MoveDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(menu)}
            className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Menu Settings</h2>
          <p className="text-sm text-slate-600 mt-1">
            Edit labels, show/hide menus, reorder, and add new menu items. Sub-menus are shown indented under their parent.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
          <button
            onClick={() => { setShowAddForm(v => !v); setAddError(''); setAddForm(EMPTY_FORM); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-blue-900">New Menu Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Menu Key <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={addForm.menu_key}
                onChange={e => setAddForm(f => ({ ...f, menu_key: e.target.value }))}
                placeholder="e.g. my_page"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Unique identifier (lowercase, underscores). This becomes the page route.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parent Menu <span className="text-slate-400">(optional)</span></label>
              <select
                value={addForm.parent_key}
                onChange={e => setAddForm(f => ({ ...f, parent_key: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="">— Top-level menu —</option>
                {topLevelKeys.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Leave blank to add as a top-level menu item.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">English Label <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={addForm.menu_label}
                onChange={e => setAddForm(f => ({ ...f, menu_label: e.target.value }))}
                placeholder="e.g. My Page"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tamil Label <span className="text-slate-400">(optional)</span></label>
              <input
                type="text"
                value={addForm.menu_label_tamil}
                onChange={e => setAddForm(f => ({ ...f, menu_label_tamil: e.target.value }))}
                placeholder="தமிழ் பெயர்"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {adding ? 'Adding...' : 'Add Item'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddError(''); setAddForm(EMPTY_FORM); }}
              className="px-5 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">English Label</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tamil Label</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Visibility</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {topLevel.map((menu, index) => {
              const kids = childrenOf(menu.menu_key);
              return [
                renderRow(menu, index, topLevel.length, false,
                  () => moveTopLevel(index, -1),
                  () => moveTopLevel(index, 1)
                ),
                ...kids.map((child, ci) =>
                  renderRow(child, ci, kids.length, true,
                    () => moveChild(menu.menu_key, ci, -1),
                    () => moveChild(menu.menu_key, ci, 1)
                  )
                ),
              ];
            })}
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
