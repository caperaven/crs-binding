import {ViewBase} from "../../src/view/view-base.js";
import {createData} from "./../data-factory.js";

export default class InflationCells extends ViewBase {
    async preLoad() {
        this.setProperty("start", 0);
        this.setProperty("end", 9);

        let data = await createData(100, this._dataId);

        this.db = await crs.intent.db.create_data_dump({args: {
                name: "batch_db",
                version: 1,
                tables: {
                    data: {
                        indexes: {
                            id: { unique: true }
                        }
                    }
                },
                store: "data",
                records: data
            }});

        await crs.intent.dom.create_inflation_template({args: {
                template_id: "tpl_generated",
                tag: "div",
                source: {
                    code:           {classes: ["cell"]},
                    description:    {classes: ["cell"]},
                    date:           {classes: ["cell"]}
                }
            }});

        data = null;
    }

    load() {
        super.load();
    }

    async renderBatch(start, end) {
        let batch = await crs.intent.db.get_batch({ args: {
                db: this.db,
                store: "data",
                start: start,
                end: end
            }})

        await crs.intent.dom.elements_from_template({ args: {
                template_id     : "tpl_generated",
                data            : batch,
                parent          : "#inflation-grid",
                row_index       : 0
            }}, this)

        batch = null;
    }

    async update() {
        const start = this.getProperty("start");
        const end = this.getProperty("end");
        await this.renderBatch(start, end);
    }

    async updateRow() {
        let batch = await crs.intent.db.get_batch({ args: {
                db: this.db,
                store: "data",
                start: 90,
                end: 92
            }})

        await crs.intent.dom.elements_from_template({ args: {
                template_id     : "tpl_generated",
                data            : batch,
                parent          : "#inflation-grid",
                row_index       : 5
            }}, this)
    }
}