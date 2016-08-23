require(['jquery'], function($)
{
    var easyMode = {
        stage: 0,
        KERNEL_READY: 1,
        NOTEBOOK_READY: 2,
        DOM_READY: 4,
        ENV_READY: 7,
        building: false,
        present: false,
        ready: false,
        cells: {
            total: 0,
            execution_queue: []
        }
    };
    /**
     * Trigger reload event on parent document
     */
    function reloadParentData()
    {
        window.parent.iframeReloadHook && window.parent.iframeReloadHook();
    }

    /**
     *  Show EasyMode
     *
     *  Hide everything but IPython form
     */
    function showEasyMode()
    {
        if (easyMode.ready) $(document.body).addClass('oni').addClass('oni_easy_mode');

        $(document.body).removeClass('oni_ninja_mode');
    }

    /**
     *  Hide Easy Mode
     *
     *  Show full IPython Notebook
     */
    function hideEasyMode()
    {
        $(document.body).addClass('oni_ninja_mode').removeClass('oni').removeClass('oni_easy_mode');
    }

    /**
     *  Look for UI widgets
     */
    function isEasyModePresent()
    {
        return $('.widget-area > .widget-subarea > .widget-box').length>0;
    }

    function insertProgressIndicator()
    {
        $(document.body).append(
            '<div id="oni_easy_mode_loader">' +
                '<span id="oni_easy_mode_loader_details"></span>' +
                '<span id="oni_easy_mode_loader_spinner"></span>' +
            '</div>'
        );
    }

    /**
     *  Remove progress indicator
     */
    function removeProgressIndicator()
    {
        $('#oni_easy_mode_loader').remove();
    }

    /**
     *  Updates progress indicator's details
     */
    function updateProgressIndicator(content)
    {
        $('#oni_easy_mode_loader_details').html(content);
    }

    /**
     *  Show a progress indicator to users
     */
    function showBuildingUiIndicator()
    {
        insertProgressIndicator();

        updateProgressIndicator(
            'Building UI <span id="oni_easy_mode_loader_progress">0</span>%'
        );
    }

    /**
     *  Update progress indicator
     */
    function updateBuildingUiIndicator()
    {
        var p;

        p = (easyMode.cells.total-easyMode.cells.execution_queue.length) * 100 / easyMode.cells.total;

        $('#oni_easy_mode_loader_progress').text(Math.floor(p));
    }

    function easyModeBootStrap (IPython)
    {
        if (easyMode.stage!=easyMode.ENV_READY) return;

        // 1. Look for widgets
        if (isEasyModePresent())
        {
            // 1.1 Widgets present
            easyMode.ready = true;
            // 1.1.1 Make sure they are visible
            removeProgressIndicator();
            showEasyMode();
        }
        else
        {
            // 1.2 Widgets not present
            easyMode.building = true;

            console.info('ONI: Building easy mode...');

            // 1.2.1 Create an exection queue to display progress
            easyMode.cells.execution_queue = [];

            easyMode.cells.total = 0;
            IPython.notebook.get_cells().forEach(function (cell)
            {
                if (cell.cell_type==='code')
                {
                    easyMode.cells.total++;
                }
            });
            // Make it twice to show progress when requesting execution
            easyMode.cells.total++;

            // 1.2.2 Execute all cells ( Generate UI )
            IPython.notebook.execute_all_cells();

            updateBuildingUiIndicator();
        }
    }
    function isEasyModeAvailable()
    {
        return window.parent!=window;
    }

    function isEasyModeEnabled() {
        return /showEasyMode/.test(window.location.hash);
    }

    function isNinjaModeEnabled() {
        return /showNinjaMode/.test(window.location.hash);
    }

    if (isEasyModeAvailable()) {
        // Add oni CSS class for styling
        $(document.body).addClass('oni');

        // Listen for URL's hash changes
        $(window).on('hashchange', function ()
        {
            if (isEasyModeEnabled()) showEasyMode();
            else if (isNinjaModeEnabled()) hideEasyMode();
        });

        $(function () {
            // Show progress indicator
            showBuildingUiIndicator();
        });
    }

    /**
     * The following code enables toggle from normal user mode (wizard) and ninja node (notebook UI)
     */
    require(['base/js/namespace', 'base/js/events'], function(IPython, events)
    {
        // Do nothing when running stand alone
        if (!isEasyModeAvailable()) return;

        // We are running inside and iframe from ONI. Let's have some fun!

        // Let Notebook be aware it is running on an iframe
        IPython._target = '_self';

        events.on('kernel_busy.Kernel', function ()
        {
            // Skip this event while building UI
            if (!easyMode.ready) return;

            $('#notebook button.btn:not([disabled])').addClass('oniDisabled').attr('disabled', 'disabled');

            insertProgressIndicator();
        });

        events.on('kernel_idle.Kernel', function ()
        {
            // Skip this event while building UI
            if (!easyMode.ready) return;

            removeProgressIndicator();

            $('#notebook button.btn.oniDisabled').removeClass('oniDisabled').removeAttr('disabled');
        });

        events.on('kernel_ready.Kernel', function ()
        {
            console.info('ONI: Kernel is ready');

            easyMode.stage |= easyMode.KERNEL_READY;

            easyModeBootStrap(IPython);
        });

        events.on('notebook_loaded.Notebook', function ()
        {
            console.info('ONI: Notebook loaded');

            easyMode.stage |= easyMode.NOTEBOOK_READY;

            easyModeBootStrap(IPython);
        });

        events.on('shell_reply.Kernel', function (evt, data)
        {
            var reply, cell, cellIdx;

            reply = data.reply;
            cell = easyMode.cells.execution_queue.shift();

            console.log('Last execution status: ' + reply.content.status);

            if ((easyMode.building || easyMode.ready) && reply.content.status==='error')
            {
                // First error found
                easyMode.building = false;
                easyMode.ready = false;
                isEasyModeEnabled() && alert('Ooops some code failed. Please go to ipython notebook mode and manually fix the error.');
                $(document.body).removeClass('oni');
                removeProgressIndicator();
                hideEasyMode();
                // Select and scroll to first cell with errors
                cellIdx = IPython.notebook.find_cell_index(cell);
                IPython.notebook.scroll_to_cell(cellIdx);
                IPython.notebook.select(cellIdx);
            }

            if (!easyMode.building)
            {
                return;
            }

            if (easyMode.cells.execution_queue.length===0)
            {
                console.info('ONI: Cell execution has finished');

                easyMode.ready = true;
                easyMode.building = false;

                removeProgressIndicator();
                isEasyModeEnabled() && showEasyMode();
            }
            else
            {
                updateBuildingUiIndicator();
            }
        });

        events.on('execute.CodeCell', function (ev, obj)
        {
            var cell;

            if (!easyMode.building && !easyMode.ready) return;

            cell = obj.cell;

            easyMode.cells.execution_queue.push(cell);

            console.info('ONI: Cell execution requested: ' + easyMode.cells.execution_queue.length + ' of ' + easyMode.cells.total);

            cell.clear_output(false);
            // There seems to be a bug on IPython sometimes cells with widgets dont get cleared
            // Workaround:
            cell.output_area.clear_output(false, true);
        });

        $(function ()
        {
            console.info('ONI: DOM is ready');

            easyMode.stage |= easyMode.DOM_READY;

            easyModeBootStrap(IPython);
        });
    });
});