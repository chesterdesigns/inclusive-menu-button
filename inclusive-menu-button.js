(function (global) {
  'use strict'

  // Constructor
  function MenuButton (button) {
    // Save a reference to the element
    this.button = button

    // Add (initial) button semantics
    this.button.setAttribute('aria-haspopup', true)
    this.button.setAttribute('aria-expanded', false)

    // Get the menu
    this.menuId = this.button.getAttribute('data-inclusive-menu-opens')
    this.menu = document.getElementById(this.menuId)

    // If the menu doesn't exist
    // exit with an error referencing the missing
    // menu's id
    if (!this.menu) {
      throw new Error('#' + this.menuId + ' menu missing')
    }

    // Add menu semantics
    this.menu.setAttribute('role', 'menu')

    // Hide menu initially
    this.menu.hidden = true

    // Get the menu items
    this.menuItems = this.menu.querySelectorAll('button')

    if (this.menuItems.length === 0) {
      throw new Error('The #' + this.menuId + ' menu has no menu items')
    }

    this.firstItem = this.menuItems[0]
    this.lastItem = this.menuItems[this.menuItems.length - 1]

    Array.prototype.forEach.call(this.menuItems, function (menuItem) {
      // Add menu item semantics
      menuItem.setAttribute('role', 'menuitem')

      // Prevent tab focus on menu items
      menuItem.setAttribute('tabindex', '-1')

      // Handle key presses for menuItem
      menuItem.addEventListener('keydown', function (e) {
        // Go to next/previous item if it exists
        // or loop around
        var adjacent

        if (e.keyCode === 40) {
          e.preventDefault()
          adjacent = menuItem.nextElementSibling || this.firstItem
          adjacent.focus()
        }

        if (e.keyCode === 38) {
          e.preventDefault()
          adjacent = menuItem.previousElementSibling || this.lastItem
          adjacent.focus()
        }

        // Close on escape or tab
        if (e.keyCode === 27 || e.keyCode === 9) {
          this.toggle()
        }

        // If escape, refocus menu button
        if (e.keyCode === 27) {
          e.preventDefault()
          this.button.focus()
        }
      }.bind(this))

      menuItem.addEventListener('click', function (e) {
        // pass menu item node to select method
        this.select(menuItem)

        // close menu and focus menu button
        this.close()
        this.button.focus()
      }.bind(this))
    }.bind(this))

    // Handle button click
    this.button.addEventListener('click', function () {
      this.toggle()
    }.bind(this))

    // Also toggle on down arrow
    this.button.addEventListener('keydown', function (e) {
      if (e.keyCode === 40) {
        if (this.menu.hidden) {
          this.toggle()
        } else {
          this.firstItem.focus()
        }
      }

      // close menu on up arrow
      if (e.keyCode === 38) {
        this.close()
      }
    }.bind(this))

    // initiate listeners object for public events
    this._listeners = {}

  }

  // Open method
  MenuButton.prototype.open = function () {
    this.button.setAttribute('aria-expanded', true)
    this.menu.hidden = false
    this.menuItems[0].focus()

    // fire open event
    this._fire('open')

    return this
  }

  // Close method
  MenuButton.prototype.close = function () {
    this.button.setAttribute('aria-expanded', false)
    this.menu.hidden = true

    // fire open event
    this._fire('close')

    return this
  }

  // Toggle method
  MenuButton.prototype.toggle = function () {
    var expanded = this.button.getAttribute('aria-expanded') === 'true'

    return expanded ? this.close() : this.open()
  }

  MenuButton.prototype.select = function (choice) {
    // fire open event
    this._fire('choose', choice)

    return this
  }

  MenuButton.prototype._fire = function (type, data) {
    var listeners = this._listeners[type] || []

    listeners.forEach(function (listener) {
      listener(data)
    })
  }

  MenuButton.prototype.on = function (type, handler) {
    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = []
    }

    this._listeners[type].push(handler)

    return this
  }

  // Export MenuButton
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MenuButton
  } else if (typeof define === 'function' && define.amd) {
    define('MenuButton', [], function () {
      return MenuButton
    })
  } else if (typeof global === 'object') {
    // attach to window
    global.MenuButton = MenuButton
  }
}(this))
