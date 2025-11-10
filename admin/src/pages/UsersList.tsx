import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import type { User, PaginationInfo } from '../api/users';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const loadUsers = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAll({ page, limit });
      setUsers(response.data || []);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error loading users:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || `Ошибка ${err.response?.status || 'неизвестная'}: Не удалось загрузить пользователей`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Ошибка: </strong>
        <span className="block sm:inline">{error}</span>
        <div className="mt-2 text-sm text-red-600">
          <p>Проверьте:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Запущен ли бэкенд на порту 3000</li>
            <li>Подключена ли база данных</li>
            <li>Существует ли таблица users</li>
          </ul>
          <p className="mt-2 text-xs">Откройте консоль браузера (F12) для деталей ошибки</p>
        </div>
        <button
          onClick={loadUsers}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении количества элементов
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Кнопка "Предыдущая"
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        Предыдущая
      </button>
    );

    // Первая страница
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 text-gray-700">
            ...
          </span>
        );
      }
    }

    // Номера страниц
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    // Последняя страница
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 text-gray-700">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
        >
          {pagination.totalPages}
        </button>
      );
    }

    // Кнопка "Следующая"
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          currentPage === pagination.totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        Следующая
      </button>
    );

    return buttons;
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Пользователи</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Список всех зарегистрированных пользователей системы
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
              На странице:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button
            onClick={() => loadUsers(currentPage, itemsPerPage)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Обновить
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {users.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Пользователи не найдены</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        {user.telegramId && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.2 2.1-1.062 7.5-1.5 9.95-.19 1.05-.55 1.4-1.05 1.4-.9.05-1.58-.6-2.45-1.2-1.35-1.05-2.1-1.6-3.4-2.55-1.5-1.2-.53-1.85.33-2.9.23-.28 4.25-3.9 4.33-4.23.01-.03.02-.15-.06-.22-.08-.07-.2-.05-.28-.03-.12.03-2.02 1.28-5.7 3.75-.54.38-1.03.56-1.47.55-.49-.01-1.43-.28-2.13-.5-.86-.28-1.54-.43-1.48-.91.03-.25.4-.5 1.1-.75 4.25-1.85 7.08-3.08 8.5-3.7 2.1-.9 2.54-1.05 2.83-1.05.6 0 .98.4.68 1.18z"/>
                            </svg>
                            <span className="text-gray-500">Telegram:</span>
                            <span className="font-medium">
                              {user.telegramUsername ? `@${user.telegramUsername}` : ''}
                              {user.telegramUsername && <span className="text-gray-400 mx-1">•</span>}
                              <span>ID: {user.telegramId}</span>
                            </span>
                          </div>
                        )}
                        {user.email && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-500">Телефон:</span>
                            <span className="font-medium">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                    <div className="text-sm text-gray-400">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagination.total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Показано <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, pagination.total)}
            </span>{' '}
            из <span className="font-medium">{pagination.total}</span> пользователей
          </div>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
}

