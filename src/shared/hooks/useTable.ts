import { useState, useMemo } from "react";

interface UseTableOptions<T> {
    searchFields?: (keyof T)[];
    initialRowsPerPage?: number;
}

export const useTable = <T,>(data: T[], options: UseTableOptions<T> = {}) => {
    const { searchFields, initialRowsPerPage = 10 } = options;

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    const [searchText, setSearchText] = useState("");

    const onSearchChange = (value: string) => {
        setSearchText(value);
        setPage(1);
    };

    const onRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const filteredData = useMemo(() => {
        if (!searchText) return data;
        const lowerSearch = searchText.toLowerCase();
        return data.filter((item) => {
            const fieldsToSearch = searchFields || (Object.keys(item as object) as (keyof T)[]);
            return fieldsToSearch.some((field) => {
                const value = (item as any)[field];
                return value && String(value).toLowerCase().includes(lowerSearch);
            });
        });
    }, [data, searchText, searchFields]);

    const paginatedData = useMemo(() => {
        return filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    return {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage: onRowsPerPageChange,
        searchText,
        setSearchText: onSearchChange,
        filteredData,
        paginatedData,
        totalRows: filteredData.length,
    };
};
