**• TOPIC:** Smart farming with web service and pub-sub model.

**• DESCRIPTION:** Assume that we have a plant in particular; let's say we have a mushroom house farm. We have a minimum of 3 sensors: humidity, temperature, and wind. Everything is in a simulation; we don't need to have an ESP32 board. We need to implement a pub-sub model (MQTT) and some kind of service. For example, if the temperature is too low, the system will turn on the AC to balance out the farm. Or if the dirt is too dry, then we can warn the farmer.

**• INSTALLING PACKAGES VIA CMD:** npm install dotenv express http-proxy-middleware mqtt nodemon pg

**• INSTALLING NODE-RED (FOR DASHBOARD) VIA CMD:** npm install -g --unsafe-perm node-red

**• CONFIGURING NODE-RED:** Open CMD, run: node-red, then minimize. Go to localhost:1880, open the top right menu or Ctrl + I to import the flows.json in this project.

**• CREATING DATABASE:**

    -- Database: MUSHROOM_HOUSE

    -- DROP DATABASE IF EXISTS "MUSHROOM_HOUSE";

    CREATE DATABASE "MUSHROOM_HOUSE"
        WITH
        OWNER = postgres
        ENCODING = 'UTF8'
        LC_COLLATE = 'English_United States.1252'
        LC_CTYPE = 'English_United States.1252'
        LOCALE_PROVIDER = 'libc'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1
        IS_TEMPLATE = False;

    COMMENT ON DATABASE "MUSHROOM_HOUSE"
        IS 'A time-series database for monitoring and managing environmental conditions, actuator states, and automated controls in an indoor mushroom cultivation system.';

**• CREATING TABLES:**

**1. FACTORS**

    -- Table: public.FACTORS

    -- DROP TABLE IF EXISTS public."FACTORS";

    CREATE TABLE IF NOT EXISTS public."FACTORS"
    (
        "Airflow" real NOT NULL,
        "Humidity" real NOT NULL,
        "Light" real NOT NULL,
        "Moisture" real NOT NULL,
        "Temperature" real NOT NULL,
        "Timestamp" timestamp without time zone NOT NULL,
        CONSTRAINT "FACTORS_pkey" PRIMARY KEY ("Timestamp")
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public."FACTORS"
        OWNER to postgres;
**2. ACTUATORS**

    -- Table: public.ACTUATORS

    -- DROP TABLE IF EXISTS public."ACTUATORS";

    CREATE TABLE IF NOT EXISTS public."ACTUATORS"
    (
        "Ventilation_fan" boolean NOT NULL,
        "Humidifier" boolean NOT NULL,
        "LED_grow_lights" boolean NOT NULL,
        "Water_pump" boolean NOT NULL,
        "Heater" boolean NOT NULL,
        "Cooler" boolean NOT NULL,
        "Timestamp" timestamp without time zone NOT NULL,
        CONSTRAINT "ACTUATORS_pkey" PRIMARY KEY ("Timestamp")
    )

    INSERT INTO "ACTUATORS" VALUES (true, false, true, false, false, true, CURRENT_TIMESTAMP);

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public."ACTUATORS"
        OWNER to postgres;

**3. AUTOMATION**

    -- Table: public.AUTOMATION

    -- DROP TABLE IF EXISTS public."AUTOMATION";

    CREATE TABLE IF NOT EXISTS public."AUTOMATION"
    (
        "Airflow" boolean NOT NULL,
        "Humidity" boolean NOT NULL,
        "Light" boolean NOT NULL,
        "Moisture" boolean NOT NULL,
        "Temperature" boolean NOT NULL,
        "Timestamp" timestamp without time zone NOT NULL,
        CONSTRAINT "AUTOMATION_pkey" PRIMARY KEY ("Timestamp")
    )

    INSERT INTO "AUTOMATION" VALUES (true, true, true, true, true, CURRENT_TIMESTAMP);

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public."AUTOMATION"
        OWNER to postgres;

**• RUNNING:**

0. Modify PG information in .env
1. node server.js
2. node-red
3. Access the dashboard via either localhost:1880/ui or localhost:8888