import { Box, Center, Flex, Link, List, ListItem, Spinner, Stack, Text } from '@chakra-ui/react';
import Breadcrumbs from 'components/breadcrumb';
import { Error } from 'components/error';
import { FormListItem } from 'components/form-list-item';
import { FormWrapper } from 'components/form-wrapper';
import AppLayout from 'layout/app-layout';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FunctionComponent, useState } from 'react';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import { routes } from 'routes';
import useSWR from 'swr';
import { compose } from 'lib/compose';
import {
  AccessOperationEnum,
  AccessServiceEnum,
  requireNextAuth,
  useAuthorizationApi,
  withAuthorization,
} from '@roq/nextjs';
import { UserPageTable } from 'components/user-page-table';

import { getTableById } from 'apiSdk/tables';
import { TableInterface } from 'interfaces/table';
import { ReservationListPage } from 'pages/reservations';

function TableViewPage() {
  const { hasAccess } = useAuthorizationApi();
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<TableInterface>(
    () => (id ? `/tables/${id}` : null),
    () =>
      getTableById(id, {
        relations: ['restaurant'],
      }),
  );

  const [deleteError, setDeleteError] = useState(null);
  const [createError, setCreateError] = useState(null);

  return (
    <AppLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              label: 'Tables',
              link: '/tables',
            },
            {
              label: 'Table Details',
              isCurrent: true,
            },
          ]}
        />
      }
    >
      <Box rounded="md">
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <>
            <FormWrapper wrapperProps={{ border: 'none', gap: 3, p: 0 }}>
              <Text
                sx={{
                  fontSize: '1.875rem',
                  fontWeight: 700,
                  color: 'base.content',
                }}
              >
                Table Details
              </Text>
              <List
                w="100%"
                css={{
                  '> li:not(:last-child)': {
                    borderBottom: '1px solid var(--chakra-colors-base-300)',
                  },
                }}
              >
                <FormListItem label="Number" text={data?.number} />

                <FormListItem
                  label="Created At"
                  text={format(parseISO(data?.created_at as unknown as string), 'dd-MM-yyyy')}
                />

                <FormListItem
                  label="Updated At"
                  text={format(parseISO(data?.updated_at as unknown as string), 'dd-MM-yyyy')}
                />

                {hasAccess('restaurant', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                  <FormListItem
                    label="Restaurant"
                    text={
                      <Link as={NextLink} href={`/restaurants/view/${data?.restaurant?.id}`}>
                        {data?.restaurant?.name}
                      </Link>
                    }
                  />
                )}
              </List>
            </FormWrapper>

            <Box borderRadius="10px" border="1px" borderColor={'base.300'} mt={6}>
              <ReservationListPage
                filters={{ table_id: id }}
                hidePagination={true}
                hideTableBorders={true}
                pageSize={5}
                titleProps={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </AppLayout>
  );
}

export default compose(
  requireNextAuth({
    redirectTo: '/',
  }),
  withAuthorization({
    service: AccessServiceEnum.PROJECT,
    entity: 'table',
    operation: AccessOperationEnum.READ,
  }),
)(TableViewPage);
