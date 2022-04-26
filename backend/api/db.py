import os
import psycopg2
import psycopg2
from psycopg2.extras import RealDictCursor


class DB:
    def __init__(self):
        config = config_from_cmdline_args(None, user_agent=user_agent)
        pg_uri = config.get_string('pg.pg_uri').unobfuscated
        self.conn = psycopg2.connect(pg_uri)

    def create_tables():
        pass

	def load(data, source):
    columns = ",".join(source.columns)
    insert_query = f'insert into {source.name} ({columns}) values %s'
    psycopg2.extras.execute_values (
        cursor, insert_query, data, template=None, page_size=100
    )

    def fetchall_query(self, query, params):
        with self.instance.conn:
            with self.instance.conn.cursor(cursor_factory=RealDictCursor) as curs:
                curs.execute(query, params)
                return curs.fetchall()

    def get_dir_by_inode(self, inode):
        query = 'SELECT * FROM sf.dir_current WHERE inode=%s'
        return self.fetchone_query(query, (inode,))

    def load():
        pass

    def fetch_data(start=None, end=None):
        pass
