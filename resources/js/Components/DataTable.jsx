// components/DataTable.jsx

import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from "@chakra-ui/react";

export default function DataTable({ columns, data, actions }) {
    return (
        <Box borderWidth="1px" rounded="md" p={4}>
            <TableContainer>
                <Table variant="striped" colorScheme="gray">
                    <Thead>
                        <Tr>
                            {columns.map((col) => (
                                <Th key={col.field}>{col.headerName}</Th>
                            ))}
                            {actions && <Th>Actions</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((row, idx) => (
                            <Tr key={idx}>
                                {columns.map((col) => (
                                    <Td key={col.field}>{row[col.field]}</Td>
                                ))}
                                {actions && <Td>{actions(row)}</Td>}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
}
